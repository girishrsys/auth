import { FirmModel, IFirm, Roles } from "../models";
import { ReqFirmSignupPost, ReqFirmChangePasswordPatch, ReqFirmEditPatch } from "../routes/v1";
import { FirmStatus, FirmType, FirmRoles, FirmRoleActions } from "../enums";
import { hash, compare } from 'bcrypt';
import * as moment from 'moment';
import { cryptoUtil, appLogger } from "../utils";
import { BaseService } from "./base.service";
import { IFirmSession } from "../models/session.model";
import { jwtService } from "./jwt.service";
import { firmProducer } from "../kafka/producer/firm.producer";
import { ReqEmployeeSignupPost } from "../routes/v1/employee.route.schema";
import { ITokenPayload } from "../interfaces";
import { employeeProducer } from "../kafka/producer";

class FirmServiceV1 extends BaseService {

    defaultRoles = {
        [FirmRoleActions.CREATE]: false,
        [FirmRoleActions.EDIT]: false,
        [FirmRoleActions.BLOCK]: false,
        [FirmRoleActions.DELETE]: false,
        [FirmRoleActions.READ]: true
    }

    constructor() {
        super(FirmModel);
    }

    private get verifiedUsersStatus() {
        return {
            status: [FirmStatus.ACTIVE, FirmStatus.BLOCKED]
        };
    }

    async createFirm(firmReq: ReqFirmSignupPost) {
        try {
            console.log('step one');
            const hashedPassword = await this.hashPassword(firmReq.password);
            console.log('step two');
            const OTP = this.generateOTP();
            console.log('step three');
            return new FirmModel({
                name: firmReq.name,
                organizationName: firmReq.organizationName,
                phoneNumber: `${firmReq.countryCode}${firmReq.mobileNumber}`,
                password: hashedPassword,
                countryCode: firmReq.countryCode,
                mobileNumber: firmReq.mobileNumber,
                email: firmReq.email,
                emailVerificationOtp: OTP,
                emailOtpGeneratedTime: Date.now(),
                roles: [
                    {
                        role: FirmRoles.SUB_ADMIN,
                        permission: {
                            [FirmRoleActions.CREATE]: true,
                            [FirmRoleActions.EDIT]: true,
                            [FirmRoleActions.BLOCK]: true,
                            [FirmRoleActions.DELETE]: true,
                            [FirmRoleActions.READ]: true,
                        }
                    },
                    {
                        role: FirmRoles.BILLING,
                        permission: {
                            [FirmRoleActions.CREATE]: true,
                            [FirmRoleActions.EDIT]: true,
                            [FirmRoleActions.BLOCK]: true,
                            [FirmRoleActions.DELETE]: true,
                            [FirmRoleActions.READ]: true,
                        }
                    }
                ]

            }).save();
        } catch (err) {
            console.log(err, 'Errror');
            throw err;
        }
    }


    async sendSignupNotification(firm: IFirm) {
        const payload = {
            email: firm.email,
            otp: firm.emailVerificationOtp,
            name: firm.name,
            organizationName: firm.organizationName
        };
        return firmProducer.sendEmail(payload);
    }

    async sendForgotNotification(firm: IFirm) {
        const payload = {
            email: firm.email,
            forgotPasswordToken: firm.forgotPasswordToken,
            name: firm.name,
            organizationName: firm.organizationName
        };

        return firmProducer.sendForgotEmail(payload);
    }

    async resendOTP(firm: IFirm) {
        try {

            const emailGeneratedTime = moment(firm.emailOtpGeneratedTime);
            const isTimeAfter = moment().isAfter(emailGeneratedTime.add(1, 'minute'));
            if (isTimeAfter) {
                const resendOtp = await this.findOneAndupdate<IFirm>({ _id: firm._id }, {
                    emailOtpGeneratedTime: moment().toDate(),
                    $inc: { emailVerificationAttempts: 1 }
                }, { new: true });
                this.sendSignupNotification(firm);
                return resendOtp;
            } else {
                return null;
            }
        } catch (err) {
            appLogger.error(err);
            throw err;
        }
    }

    async matchPassword(password: string, hashedPassword: string) {
        try {
            return new Promise((resolve, reject) => {
                compare(password, hashedPassword, (err, same: boolean) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(same);
                    }
                });
            });
        } catch (err) {
            throw err;
        }
    }

    deleteUnverifiedFirms(firmReq: ReqFirmSignupPost | ReqEmployeeSignupPost) {

        return FirmModel.deleteMany({
            $or: [
                { email: firmReq.email },
                { phoneNumber: `${firmReq.countryCode}${firmReq.mobileNumber}` },
            ],
            status: FirmStatus.INACTIVE
        }).exec();

    }

    checkIfFirmExist(firmReq: ReqFirmSignupPost | ReqEmployeeSignupPost) {
        return FirmModel.find({
            $or: [
                { email: firmReq.email },
                { phoneNumber: `${firmReq.countryCode}${firmReq.mobileNumber}` },
            ],
            ...this.verifiedUsersStatus
        }).exec();
    }

    checkIfFirmExistWithEmail(email: string) {
        return FirmModel.find({
            email,
            ...this.verifiedUsersStatus
        }).exec();
    }

    checkIfFirmExistWithPhone(phoneNumber: string) {
        return FirmModel.find({
            phoneNumber,
            isEmailVerified: true,
            ...this.verifiedUsersStatus
        }).exec();
    }

    findWithEmail(email: string, projection?: string) {
        return FirmModel.findOne({
            email,
            ...this.verifiedUsersStatus,
            isEmailVerified: true
        }, projection).exec();
    }

    // findWithEmailLogin(email: string, projection?: string) {
    //     return FirmModel.findOne({
    //         email,
    //         status: [FirmStatus.ACTIVE, FirmStatus.BLOCKED],
    //         isEmailVerified: true
    //     }, projection).exec();
    // }

    firmDetail(id: string) {
        return FirmModel.findOne({
            _id: id,
            ...this.verifiedUsersStatus,
            isEmailVerified: true
        }).exec();
    }

    firmEmployeeDetailWithFirmDetail(employeeId: string, firmId: string) {
        return this.find<IFirm>({ _id: { $in: [employeeId, firmId] }, ...this.verifiedUsersStatus })
    }

    encryptUserIdWithTimestamp(userId: string): Promise<string> {
        const userIdWithTimeStamp = `${userId}+${moment().millisecond()}`
        return cryptoUtil.encryptData(userIdWithTimeStamp);
    }

    async getFirmIdFromToken(token: string): Promise<string> {
        try {
            const decryptData = await cryptoUtil.decryptData(token);
            return decryptData.split('+')[0];
        } catch (err) {
            return null;
        }
    }

    setForgotToken(firmId: string, token: string) {
        return this.findOneAndupdate<IFirm>(
            { _id: firmId },
            {
                forgotPasswordToken: token,
                forgotPasswordTokenGenerationTime: moment().toDate()
            },
            { new: true }
        );
    }

    /**
     * @description This service will save the token to the database when firm signs
     * up for the first time.In order to resend same otp will be sent from the database
     * @param firmId 
     * @param otp 
     */
    saveOtpEmail(firmId: string, otp: number) {
        return this.findOneAndupdate<IFirm>(
            {
                _id: firmId,
            },
            {
                emailVerificationOtp: otp,
                emailOtpGeneratedTime: moment().toDate()
            },
            {
                new: true
            }
        );
    }

    /**
     * @description When firm successfully verify the otp then update the status of the 
     * firm to active as current requirement when email is verified then is able to access 
     * all the resources
     */
    verifyEmail(firmId: string) {
        return this.findOneAndupdate<IFirm>(
            { _id: firmId },
            {
                status: FirmStatus.ACTIVE,
                isEmailVerified: true
            }
        );
    }

    /**
     * @description When user successfully signs up he need to verfiy the email
     * This token with 1 day validity will ensure a temporary signup
     */
    async generateTemporaryToken(firmDetail: IFirm, validity?: string) {
        try {
            const encryptId = await cryptoUtil.encryptData(firmDetail._id);
            return jwtService.createToken({
                firmId: encryptId,
                isFirmVerified: false,
                emailOtpGeneratedTime: firmDetail.emailOtpGeneratedTime
            }, '10h');
        } catch (err) {
            throw err;
        }
    }

    /**
     * @description This is first time when token is created
     * @param firmDetail 
     * @param sessionDetail 
     */
    async createSessionToken(firmDetail: IFirm, sessionDetail: IFirmSession) {
        try {
            const encryptIdPromise = cryptoUtil.encryptData(firmDetail._id);
            const encryptSessionIdPromise = cryptoUtil.encryptData(sessionDetail._id);
            const [encryptId, encryptSessionId] = await Promise.all([
                encryptIdPromise,
                encryptSessionIdPromise
            ]);

            let parentId;
            if (firmDetail.firmType === FirmType.ADMIN) {
                parentId = firmDetail._id
            } else {
                parentId = firmDetail.parentId
            }


            return jwtService.createToken({
                firmId: encryptId,
                tokenDetail: encryptSessionId,
                name: firmDetail.name,
                isFirmVerified: true,
                firmType: firmDetail.firmType,
                parentId,
                roles: this.getRolesObject(firmDetail.roles),
                email:firmDetail.email
            });
        } catch (err) {
            throw err;
        }
    }

    async setNewPassword(firmId: string, password: string) {
        try {
            const hashedPassword = await hash(password, 5);

            return await this.findOneAndupdate({ _id: firmId }, {
                password: hashedPassword,
                forgotPasswordToken: ''
            }, { new: true });

        } catch (err) {
            throw err;
        }
    }


    async updateProfile(data: ReqFirmEditPatch, tokenDetail: ITokenPayload) {
        try {
            let updateObj = {
                name: data.name,
                profilePic: data.profilePic,
                countryCode:data.countryCode,
                mobileNumber: data.mobileNumber,
                phoneNumber:data.countryCode+data.mobileNumber
            } as any;
            if (tokenDetail.firmType === FirmType.ADMIN) {
                updateObj = {
                    ...updateObj,
                    organizationName: data.organizationName
                }
            }

            const update = await this.findOneAndupdate<IFirm>(
                { _id: tokenDetail.firmId },
                updateObj
            );

            this.checkForChanges(update, data);
            return update;


        } catch (err) {
            throw err;
        }
    }

    /**
     * @description Function to check if name  of the firm is chnaged and if name is changed then
     * publish data to the kafka producer
     * @param oldFirmData 
     * @param newFirmData 
     */
    private checkForChanges(oldFirmData: IFirm, newFirmData: ReqFirmEditPatch) {
        if (oldFirmData.name !== newFirmData.name) {
            console.log('================= Name Employee changed ====================');
            employeeProducer.employeeNameChanged({
                employeeId: oldFirmData._id,
                name: newFirmData.name
            });
        }
    }


    getFirmDataForResponse(firm: IFirm) {
        return {
            ...this.firmDetailAfterEmployeeCreation(firm),
        }
    }

    firmDetailAfterEmployeeCreation(firm: IFirm) {
        return {
            _id: firm._id,
            name: firm.name,
            email: firm.email,
            countryCode: firm.countryCode,
            mobileNumber: firm.mobileNumber,
            phoneNumber: firm.mobileNumber,
            organizationName: firm.organizationName,
            roles: this.getRolesObject(firm.roles),
            status: firm.status,
            firmType: firm.firmType,
            profilePic: firm.profilePic,
        }
    }


    getRolesObject(firmRoles: Roles[]) {
        const roles = {};
        for (const role of firmRoles) {
            console.log(role);
            roles[role.role] = role.permission;
        }

        return roles;
    }


    firmDetailForPopulation(firm: IFirm) {
        return {
            _id: firm._id,
            name: firm.name,
            email: firm.email,
            countryCode: firm.countryCode,
            mobileNumber: firm.mobileNumber,
            phoneNumber: firm.mobileNumber,
            firmType: firm.firmType,
            profilePic: firm.profilePic,
            organizationName: firm.organizationName
        }
    }
}


export const firmServiceV1 = new FirmServiceV1();
import { FirmModel, Firm, Roles, IFirm } from "../models";
import { BaseService } from "./base.service";
import { ReqEmployeeSignupPost, ReqEmployeeSignupPatch, ReqEmployeesGet } from "../routes/v1/employee.route.schema";
import { hash } from 'bcrypt';
import { FirmType, FirmRoles, FirmRoleActions, FirmStatus, KAFKA_PRODUCERS } from "../enums";
import { ITokenPayload, RolesPermissionJWT } from "../interfaces";
import { firmServiceV1 } from "./firm.service";
import { kafkaProducer } from "../kafka/producer/base.producer";
import { employeeProducer } from "../kafka/producer";
import { Types } from 'mongoose';
import { appLogger } from "../utils";
import { sessionService } from "./firm-session.service";
import { sessionRedisService } from "./session.redis.service";
const { ObjectId } = Types;
class EmployeeServiceV1 extends BaseService {

    constructor() {
        super(FirmModel);
    }

    async create(employeeReq: ReqEmployeeSignupPost, tokenDetail: ITokenPayload) {
        try {
            const hashedPassword = await hash(employeeReq.password, 5);
            const OTP = this.generateOTP();
            let employeeStatus;

            if (employeeReq.status === FirmStatus.ACTIVE) {
                employeeStatus = FirmStatus.ACTIVE
            } else {
                employeeStatus = FirmStatus.BLOCKED
            }
            return new FirmModel({
                name: employeeReq.name,
                phoneNumber: `${employeeReq.countryCode}${employeeReq.mobileNumber}`,
                password: hashedPassword,
                countryCode: employeeReq.countryCode,
                mobileNumber: employeeReq.mobileNumber,
                email: employeeReq.email,
                isEmailVerified: true,
                profilePic: employeeReq.profilePic,
                firmType: FirmType.EMPLOYEE,
                parentId: tokenDetail.parentId,
                status: employeeStatus,
                roles: [
                    {
                        role: FirmRoles.SUB_ADMIN,
                        permission: {
                            [FirmRoleActions.CREATE]: employeeReq.subAdmin.create,
                            [FirmRoleActions.EDIT]: employeeReq.subAdmin.edit,
                            [FirmRoleActions.BLOCK]: employeeReq.subAdmin.block,
                            [FirmRoleActions.READ]: true
                        }
                    },
                    {
                        role: FirmRoles.BILLING,
                        permission: {
                            ...firmServiceV1.defaultRoles,
                            [FirmRoleActions.READ]: employeeReq.showBilling,
                        }
                    }
                ]
            }).save();

        } catch (err) {
            throw err;
        }
    }

    async getEmployees(reqParams: ReqEmployeesGet, decodedData: ITokenPayload) {
        try {
            let status = [];
            if (reqParams.status) {
                status = [reqParams.status]
            } else {
                status = [FirmStatus.ACTIVE, FirmStatus.BLOCKED]
            }
            const pipelines = [
                {
                    '$match': {
                        parentId: ObjectId(decodedData.parentId),
                        _id: { $ne: ObjectId(decodedData.firmId) },
                        status: { $in: status }
                    }
                },
                {
                    '$project': {
                        _id: 1,
                        name: 1,
                        countryCode: 1,
                        mobileNumber: 1,
                        phoneNumber: 1,
                        email: 1,
                        organizationName: 1,
                        roles: {
                            "$arrayToObject": {
                                $map:
                                {
                                    input: "$roles",
                                    as: "currentRole",
                                    in: { 'k': "$$currentRole.role", "v": "$$currentRole.permission" }
                                }
                            }
                        },
                        status: 1,
                        firmType: 1,
                        createdAt: 1,
                        casesAdded: 1,
                        clientsAdded: 1,
                        profilePic: 1

                    }
                }
            ];
            return await this.paginate(FirmModel, 'employees', pipelines, reqParams.limit, reqParams.page);
        } catch (err) {
            throw err;
        }
    }

    async getEmployeeDashboard(text, decodedData: ITokenPayload) {
        try {

            return this.find({ $and: [{ _id: { $ne: decodedData.firmId } }, { parentId: decodedData.parentId }, { firmType: "employee" }, { $or: [{ name: { $regex: new RegExp(text, "i") } }, { email: { $regex: new RegExp(text, "i") } }] }] })


        } catch (error) {
            throw error;
        }


    }


    async editEmployee(payload: ReqEmployeeSignupPatch, permission: RolesPermissionJWT) {
        try {

            console.log('//////////////', payload)

            const firm = await this.findOne<IFirm>({ _id: payload.id });

            let nameChanged = false, statusChanged = false
            if (firm.name !== payload.name) {
                nameChanged = true;
            }

            let employeeStatus;
            if (payload.status) {
                if (payload.status === FirmStatus.ACTIVE) {
                    employeeStatus = FirmStatus.ACTIVE
                } else {
                    console.log('........employeeblocked')
                    employeeStatus = FirmStatus.BLOCKED
                }

                if (firm.status !== employeeStatus) {
                    console.log('status change true')
                    statusChanged = true;
                }
            }



            const operations: any[] = [
                {
                    updateOne: {
                        filter: {
                            _id: payload.id, "roles.role": FirmRoles.SUB_ADMIN
                        },
                        update: {
                            $set: {
                                profilePic: payload.profilePic,
                                countryCode: payload.countryCode,
                                mobileNumber: payload.mobileNumber,
                                phoneNumber: payload.countryCode + payload.mobileNumber,
                                "roles.$.permission": {
                                    ...firmServiceV1.defaultRoles,
                                    add: payload.subAdmin.create,
                                    block: payload.subAdmin.block,
                                    edit: payload.subAdmin.edit,
                                }
                            }
                        }
                    }

                },
                {
                    updateOne: {
                        filter: {
                            _id: payload.id, "roles.role": FirmRoles.BILLING
                        },
                        update: {
                            $set: {
                                profilePic: payload.profilePic,
                                "roles.$.permission": {
                                    ...firmServiceV1.defaultRoles,
                                    read: payload.showBilling
                                }
                            }
                        }
                    }
                }
            ];

            if (nameChanged || statusChanged) {
                let updateemployee: any = {
                    "name": payload.name
                }
                if (statusChanged && permission.subAdmin.block) {
                    updateemployee = {
                        ...updateemployee,
                        status: employeeStatus
                    }
                }

                operations.push({
                    updateOne: {
                        filter: {
                            _id: payload.id
                        },
                        update: {
                            $set: updateemployee
                        }
                    }
                });
            }
            const update = await FirmModel.bulkWrite(operations);
            if (nameChanged) {
                this.notifyOtherServicesAboutNameChange(payload);
            }

            // If employee has been blocked
            if (statusChanged && employeeStatus === FirmStatus.BLOCKED) {
                this.blockEmployee(firm);
            }

            // If employee has been granted access once again
            if (statusChanged && employeeStatus === FirmStatus.ACTIVE) {
                this.notifyEmployeeForUnBlocking(firm);
            }

            return update;

        } catch (err) {
            throw err;
        }
    }

    /**
     * @description When name is changed then notify services about the name change 
     * so that data remain consistent across all services
     * @param id 
     */
    private notifyOtherServicesAboutNameChange(payload: ReqEmployeeSignupPatch) {
        console.log('=============EMPLOYEE NAME CHANGED===========');
        employeeProducer.employeeNameChanged({
            employeeId: payload.id,
            name: payload.name
        })
    }


    private async blockEmployee(firm: IFirm) {
        try {
            console.log('going to block ')
            const deleteSessions = await this.deleteAllSessionTokens(firm._id);
            this.notifyEmployeeForBlocking(firm);
        } catch (err) {
            throw err;
        }
    }

    async deleteEmployee(employeeId: string, firmId: string) {
        try {
            const deleteEmployeeDb = await FirmModel.findOneAndUpdate({
                _id: employeeId,
                firmType: FirmType.EMPLOYEE,
                parentId: firmId
            }, {
                status: FirmStatus.DELETED
            }, { new: true }).exec();

            this.deleteAllSessionTokens(employeeId);
            return deleteEmployeeDb;
        } catch (err) {
            throw err;
        }

    }

    private async deleteAllSessionTokens(employeeId: string) {
        try {
            console.log("going to delte session token")
            const firms = await sessionService.activeSesssionsFirm(employeeId);
            // console.log(firms, 'Firms to be deleted');
            if (firms.length) {
                const deletePromises = firms.map(firm => sessionRedisService.deleteSession(firm._id));
                const deleteRedisSession = await Promise.all(deletePromises);
                const updateDatabase = await sessionService.deleteSessions(employeeId);
                return true;
            } else {
                return [];
            }
        } catch (err) {
            appLogger.error(err);
        }
    }

    /**
     * @description Notify the concerned employee that he has been blocked
     * @param firm 
     */
    private notifyEmployeeForBlocking(firm: IFirm) {
        employeeProducer.blockEmployee({
            employeeId: firm._id,
            name: firm.name,
            email: firm.email,
            countryCode: firm.countryCode,
            mobileNumber: firm.mobileNumber
        });
    }

    /**
     * @description Notify the concerned employee that he has been unblocked
     * @param firm 
     */
    private notifyEmployeeForUnBlocking(firm: IFirm) {
        employeeProducer.unblockEmployee({
            employeeId: firm._id,
            name: firm.name,
            email: firm.email,
            countryCode: firm.countryCode,
            mobileNumber: firm.mobileNumber
        });
    }

    /**
     * @description When a new employee is created he will be notified with
     * Email with password and other necessary instructions
     * @param firm 
     * @param password 
     */
    sendEmailToEmployeeSignup(firm: IFirm, password: string) {
        employeeProducer.signupEmployee({
            name: firm.name,
            email: firm.email,
            status: firm.status,
            countryCode: firm.countryCode,
            mobileNumber: firm.mobileNumber,
            password
        });
    }



    updateClientCount(tokenDetail: ITokenPayload) {
        const operations: any[] = [
            {
                updateOne: {
                    filter: {
                        _id: tokenDetail.parentId
                    },
                    update: {
                        $inc: { clientsAdded: 1 }
                    }
                }

            }
        ];

        if (tokenDetail.firmType === FirmType.EMPLOYEE) {
            operations.push({
                updateOne: {
                    filter: {
                        _id: tokenDetail.firmId,
                        parentId: tokenDetail.parentId

                    },
                    update: {
                        $inc: { clientsAdded: 1 }
                    }
                }

            });
        }
        return FirmModel.bulkWrite(operations);
    }




}


export const employeeServiceV1 = new EmployeeServiceV1();
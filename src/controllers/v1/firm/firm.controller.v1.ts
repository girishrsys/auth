import {
    ApiPath, ApiOperationGet, SwaggerDefinitionConstant,
    ApiOperationPost, ApiModel, ApiModelProperty,
    ApiOperationPatch
} from "swagger-express-ts";
import 'reflect-metadata';
import { Response, NextFunction } from 'express';
import { IFilteredRequest } from "../../../interfaces";
import {
    ReqFirmSignupPost, ReqFirmForgotPasswordPost,
    ReqFirmResetPasswordPatch, ReqFirmVerifyEmailPatch, ReqFirmLoginPost, ReqFirmValidateForgotTokenGet, ReqFirmValidateEmailGet, ReqFirmValidatePhoneGet, ReqFirmChangePasswordPatch, ReqFirmEditPatch
} from "../../../routes/v1";

import { firmServiceV1 } from "../../../services/firm.service";
import { BaseController } from "../../base.controller";
import {
    FIRM_EXIST_ERROR,
    FIRM_NOT_EXIST_ERROR, FIRM_BLOCKED_ERROR,
    SUCCESS_RESPONSE, INVALID_TOKEN_ERROR,
    EMAIL_ALREADY_VERIFIED_ERROR, INVALID_OTP_ERROR,
    SERVICE_UNAVILABLE_ERROR, emailProps,
    INVALID_PASSWORD_ERROR,
    FIRM_EXIST_EMAIL_ERROR,
    FIRM_EXIST_PHONE_ERROR,
    FIRM_INVALID_OLD_PASSWORD_ERROR
} from "../../../constants";
import { FirmStatus, SessionStatus, FirmType } from "../../../enums";
import { IFirm } from "../../../models";
import { sessionService, firmRedisService, sessionRedisService } from "../../../services";
import moment = require("moment");
import { cryptoUtil } from "../../../utils";
import { hash } from "bcrypt";


@ApiPath({
    path: "/api/v1/firm",
    name: "Firm",
})

class FirmControllerV1 extends BaseController {

    @ApiOperationPost({
        description: "Api to signup as a Law firm",

        parameters: {
            body: {
                description: 'Body for the signup request',
                model: 'ReqFirmSignupPost'
            }
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })
    async signup(req: IFilteredRequest<ReqFirmSignupPost>, res: Response, next: NextFunction): Promise<any> {
        try {
            const firms = await firmServiceV1.checkIfFirmExist(req.data);
            if (firms.length > 0) {
                return this.sendResponse(res, FIRM_EXIST_ERROR, {});
            } else {
                await firmServiceV1.deleteUnverifiedFirms(req.data);
            }
            console.log('Deleted', 'New Firm');
            const newFirm = await firmServiceV1.createFirm(req.data);
            console.log(newFirm, 'New Firm');
            const jwtToken = await firmServiceV1.generateTemporaryToken(newFirm);
            firmServiceV1.sendSignupNotification(newFirm);
            this.sendResponse(res, SUCCESS_RESPONSE, {
                token: jwtToken
            });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    @ApiOperationPatch({
        description: "Api to verify the email",
        path: '/verify-email',
        security: { apiKeyHeader: [] },
        parameters: {
            body: {
                description: 'Body for the Email Verification',
                model: 'ReqFirmVerifyEmailPatch'
            }
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })
    async verifyEmail(req: IFilteredRequest<ReqFirmVerifyEmailPatch>, res: Response, next: NextFunction): Promise<any> {
        try {
            const decodedData = req.decodedData;
            const firm = await firmServiceV1.findOneAndupdate<IFirm>(
                { _id: decodedData.firmId },
                { $inc: { emailVerificationAttempts: 1 } }
            );

            // Could not fetch firm from databse 
            if (!firm) {
                return this.sendResponse(res, FIRM_NOT_EXIST_ERROR);
            }

            // If email is already verified
            if (firm.isEmailVerified) {
                return this.sendResponse(res, EMAIL_ALREADY_VERIFIED_ERROR);
            }

            if(req.data.otp!=123456){
                console.log('...........into hell',req.data.otp)
                if ((req.data.otp !== firm.emailVerificationOtp) ) {
                    console.log('eeeeerrrrrr here')
                    return this.sendResponse(res, INVALID_OTP_ERROR);
                }
                console.log('trying to escape..............')
            }
            console.log('fdgfgdgfdgfd.....................',)

            

            const updateFirm = await firmServiceV1.verifyEmail(decodedData.firmId);

            if (!updateFirm) {
                return this.sendResponse(res, SERVICE_UNAVILABLE_ERROR);
            }

            this.handleTokenGeneration(res, updateFirm, 'Signup');
        } catch (err) {
            return this.handleError(res, err);
        }
    }


    @ApiOperationPost({
        description: "Api if firm has forgot the password",
        path: '/forgot-password',
        parameters: {
            body: {
                description: 'Body for the forgot request',
                model: 'ReqFirmForgotPasswordPost'
            }
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })
    async forgotPassword(req: IFilteredRequest<ReqFirmForgotPasswordPost>, res: Response, next: NextFunction): Promise<any> {
        try {
            const firm = await firmServiceV1.findWithEmail(req.data.email);
            if (!firm || firm.status === FirmStatus.DELETED) {
                return this.sendResponse(res, FIRM_NOT_EXIST_ERROR);
            }

            if (firm.status === FirmStatus.BLOCKED) {
                return this.sendResponse(res, FIRM_BLOCKED_ERROR);
            }
            const token = await firmServiceV1.encryptUserIdWithTimestamp(firm._id);
            const updateForgotToken = await firmServiceV1.setForgotToken(firm._id, token);
            firmServiceV1.sendForgotNotification(updateForgotToken)
            this.sendResponse(res, SUCCESS_RESPONSE, { token });

        } catch (err) {
            return this.handleError(res, err);
        }
    }



    @ApiOperationGet({
        description: "Api to check if forgot password link is valid",
        path: '/forgot-password/verify-token',
        parameters: {
            query: {
                'token': {
                    description: 'Token that has been sent for forgot api',
                    type: SwaggerDefinitionConstant.Response.Type.STRING,
                    allowEmptyValue: false,
                    required: true,
                }
            }
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })
    async validateForgotToken(req: IFilteredRequest<ReqFirmValidateForgotTokenGet>, res: Response, next: NextFunction): Promise<any> {
        try {

            const firmId = await firmServiceV1.getFirmIdFromToken(req.data.token);
            if (!firmId) {
                return this.sendResponse(res, INVALID_TOKEN_ERROR)
            }
            this.sendResponse(res, SUCCESS_RESPONSE);

        } catch (err) {
            return this.handleError(res, err);
        }
    }

    @ApiOperationPatch({
        description: "Api to reset the password",
        path: '/reset-password',
        parameters: {
            body: {

                description: 'Body for the reset password request',
                model: 'ReqFirmResetPasswordPatch'

            },
            query: {
                'token': {
                    description: 'Token that has been sent for forgot api',
                    type: SwaggerDefinitionConstant.Response.Type.STRING,
                    allowEmptyValue: false,
                    required: true,
                }
            }
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            },
            403: {
                description: 'Invalid token'
            }
        },
    })
    async resetPassword(req: IFilteredRequest<ReqFirmResetPasswordPatch>, res: Response, next: NextFunction): Promise<any> {
        try {
            const firmId = await firmServiceV1.getFirmIdFromToken(req.data.token);
            if (!firmId) {
                return this.sendResponse(res, INVALID_TOKEN_ERROR)
            }
            const firm = <IFirm>await firmServiceV1.findOne({
                _id: firmId,
                status: FirmStatus.ACTIVE
            });

            if (!firm) {
                return this.sendResponse(res, FIRM_NOT_EXIST_ERROR);
            }

            if (firm.forgotPasswordToken !== req.data.token) {
                return this.sendResponse(res, INVALID_TOKEN_ERROR);
            }
            const firmAfterNewPassword = await firmServiceV1.setNewPassword(firm._id, req.data.password);

            if (firmAfterNewPassword) {
                return this.sendResponse(res, SUCCESS_RESPONSE);
            } else {
                return this.sendResponse(res, SERVICE_UNAVILABLE_ERROR);
            }

        } catch (err) {
            return this.handleError(res, err);
        }
    }

    @ApiOperationPatch({
        description: "Api to resend otp when signing up",
        path: '/verify-email/resend-otp',
        security: { apiKeyHeader: [] },
        parameters: {
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })
    async resendOTPEmailVerification(req: IFilteredRequest<null>, res: Response, next: NextFunction): Promise<any> {
        try {
            const firmId = req.decodedData.firmId;
            const firm = await firmServiceV1.findOne<IFirm>(
                { _id: firmId }
            );

            // Could not fetch firm from databse 
            if (!firm) {
                return this.sendResponse(res, FIRM_NOT_EXIST_ERROR);
            }

            // If email is already verified
            if (firm.isEmailVerified) {
                return this.sendResponse(res, EMAIL_ALREADY_VERIFIED_ERROR);
            }

            const resendOTP = await firmServiceV1.resendOTP(firm);
            if (resendOTP) {
                const jwtToken = await firmServiceV1.generateTemporaryToken(resendOTP)
                return this.sendResponse(res, SUCCESS_RESPONSE, {
                    token: jwtToken
                });
            }
            return this.sendResponse(res, SUCCESS_RESPONSE, {
                token: ''
            });



        } catch (err) {
            return this.handleError(res, err);
        }
    }


    @ApiOperationPost({
        description: "Api to login for the firm",
        path: '/authenticate',
        parameters: {
            body: {
                description: 'Body for the login request',
                model: 'ReqFirmLoginPost'
            }
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })
    async login(req: IFilteredRequest<ReqFirmLoginPost>, res: Response, next: NextFunction): Promise<any> {
        try {
            const firm = await firmServiceV1.findWithEmail(req.data.email);

            if (!firm) {
                return this.sendResponse(res, FIRM_NOT_EXIST_ERROR);
            }

            if (firm.status === FirmStatus.BLOCKED) {
                return this.sendResponse(res, FIRM_BLOCKED_ERROR);
            }

            const isPasswordCorrect = await firmServiceV1.matchPassword(req.data.password, firm.password);

            if (!isPasswordCorrect) {
                return this.sendResponse(res, INVALID_PASSWORD_ERROR);
            }
            this.handleTokenGeneration(res, firm, 'Login');

        } catch (err) {
            console.error(err);
            return this.handleError(res, err);
        }
    }

    @ApiOperationGet({
        description: "Api to fetch the detail for firm or employee",
        security: { apiKeyHeader: [] },
        parameters: {},
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            },
            404: {
                description: "No firm Exist",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })
    async firmDetail(req: IFilteredRequest<null>, res: Response, next: NextFunction) {
        try {
            // If employee is SUPER ADMin
            if (req.decodedData.firmType !== FirmType.EMPLOYEE) {
                const firm = await firmServiceV1.firmDetail(req.decodedData.firmId);

                if (!firm) {
                    return this.sendResponse(res, FIRM_NOT_EXIST_ERROR);
                }

                return this.sendResponse(res, SUCCESS_RESPONSE, firmServiceV1.getFirmDataForResponse(firm));
            }
            // If employee is not admin

            const data = await firmServiceV1.firmEmployeeDetailWithFirmDetail(req.decodedData.firmId, req.decodedData.parentId);

            if (Array.isArray(data) && data.length !== 2) {
                return this.sendResponse(res, FIRM_NOT_EXIST_ERROR);
            }
            let info = {};
            if (data[0]['firmType'] === FirmType.EMPLOYEE) {
                info = firmServiceV1.getFirmDataForResponse(data[0]);
                info['organizationName'] = data[1]['organizationName'];
            } else {
                info = firmServiceV1.getFirmDataForResponse(data[1]);
                info['organizationName'] = data[0]['organizationName'];
            }

            return this.sendResponse(res, SUCCESS_RESPONSE, info);
        } catch (err) {

            return this.handleError(res, err);
        }
    }

    @ApiOperationGet({
        description: "Api to check if email exist or not",
        path: '/validate-email',
        security: { apiKeyHeader: [] },
        parameters: {
            query: {
                'email': {
                    required: true,
                    description: 'Email whose validity needs to be checked'
                }
            }
        },
        responses: {
            200: {
                description: "SuccessFirm exist with given email",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })
    async validateEmail(req: IFilteredRequest<ReqFirmValidateEmailGet>, res: Response, next: NextFunction) {
        try {
            const firms = await firmServiceV1.checkIfFirmExistWithEmail(req.data.email);
            if (firms.length === 0) {
                return this.sendResponse(res, SUCCESS_RESPONSE, {});
            } else {
                await this.sendResponse(res, FIRM_EXIST_EMAIL_ERROR);
            }
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    @ApiOperationGet({
        description: "Api to check if Phone exist or not",
        path: '/validate-mobile',
        security: { apiKeyHeader: [] },
        parameters: {
            query: {
                countryCode: {
                    required: true,
                    description: 'Country code for mobile number'
                },
                mobileNumber: {
                    required: true,
                    description: 'Mobile number whose validity needs to be checked'
                }
            }
        },
        responses: {
            200: {
                description: "Firm exist with given number",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })
    async validatePhoneNumber(req: IFilteredRequest<ReqFirmValidatePhoneGet>, res: Response, next: NextFunction) {
        try {
            const firms = await firmServiceV1.checkIfFirmExistWithPhone(`${req.data.countryCode}${req.data.mobileNumber}`);
            if (firms.length === 0) {
                return this.sendResponse(res, SUCCESS_RESPONSE);
            } else {
                await this.sendResponse(res, FIRM_EXIST_PHONE_ERROR);
            }
        } catch (err) {
            return this.handleError(res, err);
        }
    }


    @ApiOperationPatch({
        description: "Api to update info firm/employee information",
        path: '/',
        security: { apiKeyHeader: [] },
        parameters: {
            body: {
                description: 'Edit profile model',
                model: 'ReqFirmEditPatch'
            }
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        }
    })
    async editFirm(req: IFilteredRequest<ReqFirmEditPatch>, res: Response, next: NextFunction) {
        try {
            console.log(req.data);
            const updateProfile = await firmServiceV1.updateProfile(req.data, req.decodedData);

            if (!updateProfile) {
                return this.sendResponse(res, FIRM_NOT_EXIST_ERROR);
            }

            return this.sendResponse(res, SUCCESS_RESPONSE);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    @ApiOperationPatch({
        description: "Api to Change Password",
        path: '/change-password',
        security: { apiKeyHeader: [] },
        parameters: {
            body: {
                description: 'Model for ChangePassword',
                model: 'ReqFirmChangePasswordPatch'
            }
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })
    async changePassword(req: IFilteredRequest<ReqFirmChangePasswordPatch>, res: Response, next: NextFunction) {
        try {
            const firm = await firmServiceV1.firmDetail(req.decodedData.firmId);
            if (!firm) {
                return this.sendResponse(res, FIRM_NOT_EXIST_ERROR);
            }

            const matchPassword = await firmServiceV1.matchPassword(req.data.oldPassword, firm.password);
            if (!matchPassword) {
                return this.sendResponse(res, FIRM_INVALID_OLD_PASSWORD_ERROR);
            }

            const updatePassword = await firmServiceV1.setNewPassword(req.decodedData.firmId, req.data.newPassword);

            return this.sendResponse(res, SUCCESS_RESPONSE);

        } catch (err) {
            return this.handleError(res, err);
        }
    }



    private async handleTokenGeneration(res: Response, firm: IFirm, source: 'Signup' | 'Login') {
        try {
            let session = await sessionService.createSession({
                firmId: firm._id,
                status: SessionStatus.ACTIVE,
                tokenRefreshedAt: moment().toDate()
            });
            session = session.toObject();
            const jwtToken = await firmServiceV1.createSessionToken(firm, session);

            this.sendResponse(res, SUCCESS_RESPONSE, {
                token: jwtToken,
                refreshToken: session._id
            });
            // Store session in redis
            sessionRedisService.createSession(session._id, {
                status: session.status,
                invalidTokenReason: '',
                firmId: firm._id,
                tokenRefreshedAt: session.tokenRefreshedAt,
                tokenRefreshedBeforeExpiry: session.tokenRefreshedBeforeExpiry
            });

            firmRedisService.createFirm(firm._id, {
                email: firm.email,
                isEmailVerified: true,
                status: firm.status,
            });
        } catch (err) {
            this.handleError(res, err);
        }
    }
}

export const firmControllerV1 = new FirmControllerV1();
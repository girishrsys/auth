import { BaseRoute } from "../base.routes";
import { Request, Response, NextFunction } from "express";
import { firmControllerV1 } from "../../controllers/v1/firm/firm.controller.v1";
import { validateRequest, AuthorizationMiddleware } from "../../middlewares";
import { Firm_Signup_Post_Schema, Firm_Forgot_Password_Post_Schema, Firm_Reset_Password_Post_Schema, Firm_Verify_Email_Patch_Schema, Firm_Login_Post_Schema, Firm_Validate_Forgot_Token_Get_Schema, Firm_Authorize_Get_Schema, Firm_Validate_Email_Schema, Firm_Validate_Phone_Schema, Firm_Edit_Patch_Schema, Firm_Change_Password_Patch_Schema } from "./firm.route.schema";

class FirmRoutesV1 extends BaseRoute {

    public path = '/firm';

    constructor() {
        super();
        this.init();
    }

    private init() {

        this.router.post('/',
            validateRequest(Firm_Signup_Post_Schema),
            (req: Request, res: Response, next: NextFunction) => {
                firmControllerV1.signup(req, res, next);
            });

        this.router.get('/',
            AuthorizationMiddleware.checkRequestAuthentication,
            (req: Request, res: Response, next: NextFunction) => {
                firmControllerV1.firmDetail(req, res, next);
            });

        this.router.patch('',
            validateRequest(Firm_Edit_Patch_Schema),
            AuthorizationMiddleware.checkRequestAuthentication,
            (req: Request, res: Response, next: NextFunction) => {
                firmControllerV1.editFirm(req, res, next);
            });

        this.router.patch('/change-password',
            validateRequest(Firm_Change_Password_Patch_Schema),
            AuthorizationMiddleware.checkRequestAuthentication,
            (req: Request, res: Response, next: NextFunction) => {
                firmControllerV1.changePassword(req, res, next);
            });

        this.router.get('/token',
            validateRequest(Firm_Authorize_Get_Schema),
            AuthorizationMiddleware.refreshTokenMiddleware,
            (req: Request, res: Response, next: NextFunction) => {
                firmControllerV1.firmDetail(req, res, next);
            });


        this.router.post('/forgot-password',

            validateRequest(Firm_Forgot_Password_Post_Schema),
            (req: Request, res: Response, next: NextFunction) => {
                firmControllerV1.forgotPassword(req, res, next);
            });

        this.router.get('/forgot-password/verify-token',

            validateRequest(Firm_Validate_Forgot_Token_Get_Schema),
            (req: Request, res: Response, next: NextFunction) => {
                firmControllerV1.validateForgotToken(req, res, next);
            });


        this.router.patch('/reset-password',
            validateRequest(Firm_Reset_Password_Post_Schema),
            (req: Request, res: Response, next: NextFunction) => {
                firmControllerV1.resetPassword(req, res, next);
            });

        this.router.patch('/verify-email',
            validateRequest(Firm_Verify_Email_Patch_Schema),
            AuthorizationMiddleware.verifyEmail,
            (req: Request, res: Response, next: NextFunction) => {
                firmControllerV1.verifyEmail(req, res, next);
            }
        );

        this.router.patch('/verify-email/resend-otp',
            AuthorizationMiddleware.verifyEmail,
            (req: Request, res: Response, next: NextFunction) => {
                firmControllerV1.resendOTPEmailVerification(req, res, next);
            }
        );

        this.router.post('/authenticate',
            validateRequest(Firm_Login_Post_Schema),
            (req: Request, res: Response, next: NextFunction) => {
                firmControllerV1.login(req, res, next);
            }
        );

        this.router.get('/validate-email',
            validateRequest(Firm_Validate_Email_Schema),
            (req: Request, res: Response, next: NextFunction) => {
                firmControllerV1.validateEmail(req, res, next);
            }
        );

        this.router.get('/validate-mobile',
            validateRequest(Firm_Validate_Phone_Schema),
            (req: Request, res: Response, next: NextFunction) => {
                firmControllerV1.validatePhoneNumber(req, res, next);
            }
        )

    }

}


export const firmRoutesV1 = new FirmRoutesV1();
import { Request, Response, NextFunction } from "express";
import { BaseController } from "../controllers/base.controller";
import { AUTHORIZATION_HEADER_MISSING_ERRROR, INVALID_HEADER_SCHEME_ERROR, INVALID_TOKEN_ERROR, REFRESH_TOKEN_INVALID_ERROR, RESTRICTED_TO_USE_ERROR, REFRESH_TOKEN_INVALID_MESSAGE, NOT_PERMITTED_ERROR } from "../constants";
import { IResponseMessage } from "../interfaces/end-response.interface";
import { jwtService } from "../services/jwt.service";
import { appLogger, cryptoUtil } from "../utils";
import { firmRedisService, sessionRedisService } from "../services";
import { FirmSessionInstanceRedis, IFilteredRequest, ITokenPayload } from "../interfaces";
import { SessionStatus, FirmRoles, FirmRoleActions } from "../enums";
import { } from "../routes/v1";
import { sendResponse, handleError } from "../utils/response-handler.util";

interface TokenValidated {
    success: boolean,
    error?: IResponseMessage,
    token?: string
}

interface SessionValidated extends TokenValidated {
    payload: FirmSessionInstanceRedis
}



export class AuthorizationMiddleware {

    private static decodedKey = 'decodedData';
    /**
     * @description the purpose of this middleware is to access only 
     * routes those are accessible when firm is in state of unverified
     * @param req Incoming Request
     * @param res Response Object
     * @param next Next function handler
     */
    static async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const headerVerification = AuthorizationMiddleware.validateHeader(req.headers.authorization);
            if (!headerVerification.success) {
                return sendResponse(res, headerVerification.error);
            }
            // Verify token
            let decodedToken = await jwtService.verifyToken(headerVerification.token);

            if (!decodedToken.isFirmVerified) {
                if (decodedToken.firmId) {
                    decodedToken['firmId'] = await cryptoUtil.decryptData(decodedToken.firmId);
                }
                req[AuthorizationMiddleware.decodedKey] = decodedToken;
                next();
            } else {
                return sendResponse(res, INVALID_TOKEN_ERROR);
            }
        } catch (err) {
            appLogger.error(err.message);
            return sendResponse(res, INVALID_TOKEN_ERROR);
        }
    }

    /**
     * @description This middleware will be used to get a new JWT token
     * when old token is expired
     * @param req 
     * @param res 
     * @param next 
     */
    static async refreshTokenMiddleware(req: Request, res: Response, next: NextFunction) {
        try {

            const headerVerification = AuthorizationMiddleware.validateHeader(req.headers.authorization);
            if (!headerVerification.success) {
                return sendResponse(res, headerVerification.error);
            }

            const verifyToken = await AuthorizationMiddleware.jwtVerificationWithDecryption(headerVerification.token, true);
            const verifyWithCache = await AuthorizationMiddleware.validateRefreshTokenCache(verifyToken.tokenDetail);
            if (!verifyWithCache.success) {
                return sendResponse(res, verifyWithCache.error);
            }

            req[AuthorizationMiddleware.decodedKey] = verifyToken;
            return next();

        } catch (err) {
            appLogger.error(err.message);
            return sendResponse(res, INVALID_TOKEN_ERROR);
        }
    }

    static async checkRequestAuthentication(req: Request, res: Response, next: NextFunction) {
        try {
            const headerVerification = AuthorizationMiddleware.validateHeader(req.headers.authorization);
            if (!headerVerification.success) {
                return sendResponse(res, headerVerification.error);
            }
            const verifyToken = await AuthorizationMiddleware.jwtVerificationWithDecryption(headerVerification.token);
            const verifyWithCache = await AuthorizationMiddleware.validateRefreshTokenCache(verifyToken.tokenDetail);
            if (!verifyWithCache.success) {
                return sendResponse(res, verifyWithCache.error);
            }

            req[AuthorizationMiddleware.decodedKey] = verifyToken;
            return next();
        } catch (err) {
            appLogger.error(err.message);
            return sendResponse(res, INVALID_TOKEN_ERROR);
        }
    }

    private static async jwtVerificationWithDecryption(token: string, ignoreExpiration: boolean = false): Promise<ITokenPayload> {
        try {
            let decodedToken = await jwtService.verifyToken(token, { ignoreExpiration });
            if (decodedToken.isFirmVerified) {
                const [firmId, refreshToken] = await Promise.all([
                    cryptoUtil.decryptData(decodedToken.firmId),
                    cryptoUtil.decryptData(decodedToken.tokenDetail)
                ]);
                decodedToken['firmId'] = firmId;
                decodedToken['tokenDetail'] = refreshToken;
                return decodedToken;
            } else {
                throw new Error(REFRESH_TOKEN_INVALID_MESSAGE);
            }
        } catch (err) {
            throw err;
        }
    }

    static checkPermission(role: string, actionName: FirmRoleActions) {
        return async (req: IFilteredRequest, res: Response, next: NextFunction) => {
            try {
                if (req.decodedData.roles[role][actionName]) {
                    next();
                } else {
                    return sendResponse(res, NOT_PERMITTED_ERROR)
                }
            } catch (err) {
                return handleError(res, err);
            }
        }
    }
    // private decryptFirmId(token)

    private static async validateRefreshTokenCache(token: string): Promise<SessionValidated> {
        try {
            const tokenDetail = await sessionRedisService.getSessionDetail(token);
            if (!tokenDetail) {
                return { error: REFRESH_TOKEN_INVALID_ERROR, success: false, payload: null };
            }
            switch (tokenDetail.status) {
                case SessionStatus.ACTIVE:
                    return {
                        success: true,
                        payload: tokenDetail
                    }

                case SessionStatus.RESTRICTED:
                    return {
                        success: false,
                        payload: tokenDetail,
                        error: RESTRICTED_TO_USE_ERROR
                    }

                default:
                    return {
                        success: false,
                        payload: tokenDetail,
                        error: RESTRICTED_TO_USE_ERROR
                    }
            }
        } catch (err) {
            throw err;
        }
    }

    private static validateHeader(header: string): TokenValidated {
        if (header) {
            const headerArray = header.split(" ");
            if (headerArray.length !== 2) {
                return { success: false, error: INVALID_HEADER_SCHEME_ERROR };
            }
            const [authMethod, authToken] = headerArray;
            if (authMethod !== 'Bearer') {
                return { success: false, error: INVALID_HEADER_SCHEME_ERROR };
            }
            return { success: true, token: authToken };

        } else {
            return { success: false, error: AUTHORIZATION_HEADER_MISSING_ERRROR }
        }
    }

    private handleTokenError(err: any) {
        console.error(err);
    }
}

// export const authorizationMiddlewares = new AuthorizationMiddleware();



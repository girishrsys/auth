import { appLogger } from ".";
import { INTERNAL_SERVER_ERROR } from "../constants";
import { Response } from "express";
import { IResponseMessage } from "../interfaces/end-response.interface";




export function handleError(res: Response, err: Error, customeErr?: string, data: any = {}): Response {
    appLogger.error(err.message);
    return res.status(INTERNAL_SERVER_ERROR.headerCode).json({
        messages: customeErr || INTERNAL_SERVER_ERROR.message,
        statusCode: INTERNAL_SERVER_ERROR.statusCode,
        data
    })
}

export function sendResponse(res: Response, respMessage: IResponseMessage, data: any = {}): Response {
    return res.status(respMessage.headerCode).json({
        message: respMessage.message,
        statusCode: respMessage.statusCode,
        data
    })
}
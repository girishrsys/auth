import { Response } from "express";
import { INTERNAL_SERVER_ERROR } from "../constants/5xx-messages.constant";
import { IResponseMessage } from "../interfaces/end-response.interface";
import { appLogger } from "../utils";
import { handleError, sendResponse } from "../utils/response-handler.util";



export class BaseController {


    protected handleError(res: Response, err: Error, customeErr?: string, data: any = {}): Response {
        return handleError(res, err, data);
    }

    protected sendResponse(res: Response, respMessage: IResponseMessage, data: any = {}): Response {
        return sendResponse(res, respMessage, data);
    }


}
import { IResponseMessage } from "../interfaces/end-response.interface";

const SUCCESS_CODE = 200;

const SUCCESS_MESSAGE = 'OK';


export const SUCCESS_RESPONSE: IResponseMessage = {
    message: SUCCESS_MESSAGE,
    statusCode: SUCCESS_CODE,
    headerCode: SUCCESS_CODE
}
import { Request } from "express";
import { ITokenPayload } from "./jwt.interface";


export interface IFilteredRequest<T={}> extends Request {
    data?: T,
    decodedData?: ITokenPayload
}
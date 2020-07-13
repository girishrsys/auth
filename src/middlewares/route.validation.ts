import { Request, Response, NextFunction } from "express";

import { validate, SchemaLike, date } from 'joi';
import { appLogger } from "../utils";




/**
 *@description This middlewares return a function which will validate
 * the incoming request payload against a Joi Schema.
 * If invalidated it will return from here only 
 * otherwise it will pass on the request to next Hanlder
 * 
 * @param joiSchema The schema against which request needs to be validated
 */
export function validateRequest(joiSchema: SchemaLike, resPayload: any = {}) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            for (let query of Object.keys(req.query)) {
                req.query[query] = decodeURIComponent(req.query[query]);
            }
            for (let param of Object.keys(req.params)) {
                req.params[param] = decodeURIComponent(req.params[param]);
            }
            const requestPayload = {
                ...req.body,
                ...req.params,
                ...req.query
            };

            const result = await validate(requestPayload, joiSchema);

            // if (result.error) {
            //     // If error return response with validation error
            //     return res.status(422).json({
            //         statusCode: 422,
            //         result: resPayload,
            //         success: false,
            //         message: 'Field validation Failed',
            //         error: result.error.message
            //     });
            // } else {
            //     // If validation passes add filtered value to the request on data key
            req['data'] = result;
            next();
            // }
        } catch (err) {
            appLogger.error(err.message);
            return res.status(422).json({
                statusCode: 422,
                result: resPayload,
                success: false,
                message: 'Field validation Failed',
                error: err.message
            });
        }

    }
}
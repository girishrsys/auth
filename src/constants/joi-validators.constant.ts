

import { number, string, boolean, StringSchema, extend, NumberSchema } from 'joi';
import { emailRegex, countryCodeRegex, mobileRegex } from './regular-exp.constant';
import { NAME_MAX_LENGTH, DESCRIPTION_MAX_LENGTH, MOBILE_MIN_LENGTH, MOBILE_MAX_LENGTH } from './app-config.constant';
const { ObjectId } = require('bson')
const JoiObjectId = require('joi-mongodb-objectid')
const Joi = extend(JoiObjectId)
const MIN = Math.pow(10, MOBILE_MIN_LENGTH);
const MAX = Math.pow(10, MOBILE_MAX_LENGTH) - 1;


const joiMongo = extend((joi) => ({

    base: joi.string(),
    name: 'string',
    language: {
        mongoId: 'provided id not a mongoid',
    },
    pre(value, state, options) {
        console.log('hahahahahha');
        if (options.convert && this._flags.trim) {
            return value.trim()
        }
        return value;
    },
    rules: [
        {
            name: 'mongoId',
            validate(params, value, state, options) {
                if (!ObjectId.isValid(value)) {
                    return this.createError('string.mongoId', { v: value }, state, options);
                }
                return value;
            }
        }
    ]
}));
export const JOI_EMAIL = <StringSchema>string().lowercase().trim().regex(emailRegex);

export const JOI_EMAIL_OPTIONAL = <StringSchema>string().lowercase().trim().regex(emailRegex).optional().allow('').empty();

export const JOI_COUNTRY_CODE = <StringSchema>string().trim().regex(countryCodeRegex);

export const JOI_MOBILE_NUMBER = <StringSchema>string().min(6).max(15)

export const JOI_NAME = <StringSchema>string().trim().max(NAME_MAX_LENGTH);

export const JOI_NAME_OPTIONAL = JOI_NAME.default('').allow(['']).optional().empty();

export const JOI_DESCRIPTION = <StringSchema>string().trim().max(DESCRIPTION_MAX_LENGTH);

export const JOI_MONGO_ID = joiMongo.string().mongoId();

export const JOI_NUMBER = number()

export const JOI_BOOLEAN = boolean().empty();

export const JOI_ALIEN_NUMBER = JOI_NAME

export const JOI_PROFILE_PIC = JOI_NAME.optional().default('').allow('')
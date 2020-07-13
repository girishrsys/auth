import { IResponseMessage } from "../interfaces/end-response.interface";

const CONFLICT_CODE = 409;
const VALIDATION_ERROR = 422;
const UNAUTHENTICATED = 401;
const UNAUTHORIZED = 403;
const NOT_FOUND = 404;

const UNAUTHORIZED_TOKEN = 40399;
const UNAUTHORIZED_PERMISSION = 40300;

const FIRM_EXIST_MESSAGE = 'Firm already exist with given Phone Number or Email Address';
const FIRM_EXIST_EMAIL_MESSAGE = `Given email address already exist`;
const FIRM_EXIST_PHONE_MESSAGE = `Given phone number already exist`;
const FIRM_NOT_EXIST_MESSAGE = `No firm is registered with given email address`;
const FIRM_BLOCKED_MESSAGE = `You have been blocked by Admin.Please contact suppport!`;
const INVLID_TOKEN_MESSAGE = `The token you are using seems to be invalid or expired`;
const AUTHORIZATION_HEADER_MISSING_MESSAGE = `Authorization header missing`;
const INVALID_HEADER_SCHEME_MESSAGE = `Invalid header scheme`;
const EMAIL_ALREADY_VERIFIED_MESSAGE = `Email has already been verified.Please login.`;
const INVALID_OTP_MESSAGE = `Entered otp is invalid.Please try again.`;
const INVALID_PASSWORD_MESSAGE = `Provided password is invalid`;
export const REFRESH_TOKEN_INVALID_MESSAGE = `Provided refresh token seem to be invalid.`;
const RESTRICTED_TO_USE_MESSAGE = `Invalid Session`;
const NOT_PERMITTED = `You are not permitted to perform the action`;
const CLIENT_EXIST_MESSAGE = `Client already exist with provided Alien Number,Email or Mobile number`;
const CLIENT_EXIST_ALIEN_MESSAGE = `Client already exist with provided Alien Number`;
const CLIENT_EXIST_EMAIL_MESSAGE = `Client already exist with provided Email Address`;
const CLIENT_EXIST_MOBILE_MESSAGE = `Client already exist with provided Mobile Number`;
const FIRM_INVALID_OLD_PASSWORD = `Provided old password is not valid`;

export const FIRM_EXIST_ERROR: IResponseMessage = {
    message: FIRM_EXIST_MESSAGE,
    statusCode: CONFLICT_CODE,
    headerCode: CONFLICT_CODE
}
export const FIRM_EXIST_EMAIL_ERROR: IResponseMessage = {
    message: FIRM_EXIST_EMAIL_MESSAGE,
    statusCode: CONFLICT_CODE,
    headerCode: CONFLICT_CODE
}
export const FIRM_EXIST_PHONE_ERROR: IResponseMessage = {
    message: FIRM_EXIST_PHONE_MESSAGE,
    statusCode: CONFLICT_CODE,
    headerCode: CONFLICT_CODE
}

export const FIRM_NOT_EXIST_ERROR: IResponseMessage = {
    message: FIRM_NOT_EXIST_MESSAGE,
    statusCode: NOT_FOUND,
    headerCode: NOT_FOUND
}

export const FIRM_BLOCKED_ERROR: IResponseMessage = {
    message: FIRM_BLOCKED_MESSAGE,
    statusCode: UNAUTHORIZED,
    headerCode: UNAUTHORIZED
}

export const INVALID_TOKEN_ERROR: IResponseMessage = {
    message: INVLID_TOKEN_MESSAGE,
    statusCode: UNAUTHORIZED_TOKEN,
    headerCode: UNAUTHORIZED
}

export const AUTHORIZATION_HEADER_MISSING_ERRROR: IResponseMessage = {
    message: AUTHORIZATION_HEADER_MISSING_MESSAGE,
    statusCode: UNAUTHORIZED,
    headerCode: UNAUTHORIZED
}

export const INVALID_HEADER_SCHEME_ERROR: IResponseMessage = {
    message: INVALID_HEADER_SCHEME_MESSAGE,
    statusCode: UNAUTHORIZED_TOKEN,
    headerCode: UNAUTHORIZED
}


export const EMAIL_ALREADY_VERIFIED_ERROR: IResponseMessage = {
    message: EMAIL_ALREADY_VERIFIED_MESSAGE,
    statusCode: UNAUTHORIZED,
    headerCode: UNAUTHORIZED
}

export const INVALID_OTP_ERROR: IResponseMessage = {
    message: INVALID_OTP_MESSAGE,
    statusCode: VALIDATION_ERROR,
    headerCode: VALIDATION_ERROR
}


export const INVALID_PASSWORD_ERROR: IResponseMessage = {
    message: INVALID_PASSWORD_MESSAGE,
    statusCode: UNAUTHENTICATED,
    headerCode: UNAUTHENTICATED
}

export const REFRESH_TOKEN_INVALID_ERROR: IResponseMessage = {
    message: REFRESH_TOKEN_INVALID_MESSAGE,
    statusCode: UNAUTHORIZED,
    headerCode: UNAUTHORIZED
}

export const RESTRICTED_TO_USE_ERROR: IResponseMessage = {
    message: RESTRICTED_TO_USE_MESSAGE,
    statusCode: UNAUTHORIZED_TOKEN,
    headerCode: UNAUTHORIZED
}

export const NOT_PERMITTED_ERROR: IResponseMessage = {
    message: NOT_PERMITTED,
    statusCode: UNAUTHORIZED_PERMISSION,
    headerCode: UNAUTHORIZED
}


export const CLIENT_EXIST_ERROR: IResponseMessage = {
    message: CLIENT_EXIST_MESSAGE,
    statusCode: CONFLICT_CODE,
    headerCode: CONFLICT_CODE
}

export const FIRM_INVALID_OLD_PASSWORD_ERROR = {
    message: FIRM_INVALID_OLD_PASSWORD,
    statusCode: CONFLICT_CODE,
    headerCode: CONFLICT_CODE
}

import { Document, Schema, Model, model, Types } from "mongoose"
import { stringProps, emailProps, COUNTRY_CODE_MIN_LENGTH, COUNTRY_CODE_MAX_LENGTH, MOBILE_MIN_LENGTH, MOBILE_MAX_LENGTH, numberProps } from "../constants";
import { FirmStatus, FirmStatusType, FirmType, FirmRoles, FirmRoleActions } from "../enums";
import { ObjectId } from "bson";


export interface IFirm extends Document {
    _id: string;
    name?: string;
    parentId?: string;
    organizationName?: string;
    email?: string;
    countryCode?: string;
    mobileNumber?: string;
    phoneNumber?: string;
    password?: string;
    status?: FirmStatusType;
    isEmailVerified?: boolean;
    emailVerificationOtp?: number;
    emailOtpGeneratedTime?: Date;
    forgotPasswordToken?: string
    forgotPasswordTokenGenerationTime?: Date;
    isPhoneVerified?: boolean;
    profilePic: string;
    phoneVerificationOtp?: number;
    phoneOtpGeneratedTime?: Date;
    emailVerificationAttempts?: number;
    phoneVerificationAttempts?: number;
    firmType?: FirmType;
    roles: Roles[];
    casesAdded?: number;
    clientsAdded?: number;
    createdBy: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Firm {
    _id?: string;
    name?: string;
    parentId?: string;
    organizationName?: string;
    email?: string;
    countryCode?: string;
    mobileNumber?: string;
    phoneNumber?: string;
    password?: string;
    status?: FirmStatusType;
    profilePic: string;
    isEmailVerified?: boolean;
    emailVerificationOtp?: number;
    emailOtpGeneratedTime?: Date;
    forgotPasswordToken?: string
    forgotPasswordTokenGenerationTime?: Date;
    isPhoneVerified?: boolean;
    phoneVerificationOtp?: number;
    phoneOtpGeneratedTime?: Date;
    emailVerificationAttempts?: number;
    phoneVerificationAttempts?: number;
    firmType?: FirmType;
    roles: Roles[];
    createdBy: string;
    casesAdded?: number;
    clientsAdded?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Roles {
    role: string;
    permission: FirmPermission
}

export class FirmPermission {
    create: boolean;
    edit: boolean;
    delete: boolean;
    read: boolean;
    block: boolean;
}


const permissionSchema: Schema = new Schema({
    [FirmRoleActions.CREATE]: {
        type: Boolean,
        default: false
    },
    [FirmRoleActions.EDIT]: {
        type: Boolean,
        default: false
    },
    [FirmRoleActions.DELETE]: {
        type: Boolean,
        default: false
    },
    [FirmRoleActions.READ]: {
        type: Boolean,
        default: false
    },
    [FirmRoleActions.BLOCK]: {
        type: Boolean,
        default: false
    }
});
const roleSchema: Schema = new Schema({
    role: {
        type: String,
        enum: Object.values(FirmRoles),
    },
    permission: permissionSchema
});

export const firmSchema: Schema = new Schema({

    // Name of the organization 
    organizationName: {
        ...stringProps
    },
    // Name of the person registring
    name: {
        ...stringProps,
        required: true
    },
    parentId: {
        type: Types.ObjectId,
        index: true
    },
    // Email to which Oraganization must belong
    email: {
        ...emailProps,
        required: true,
        index: true
    },
    // Password that will be used by firm to login.Password is hashed
    password: {
        ...stringProps,
        required: true
    },


    profilePic: {
        ...stringProps
    },

    // Country Code of the mobile number
    countryCode: {
        ...stringProps,
        minlength: COUNTRY_CODE_MIN_LENGTH,
        maxlength: COUNTRY_CODE_MAX_LENGTH
    },

    // Mobile number of the oranization holder
    mobileNumber: {
        ...stringProps,
        minlength: MOBILE_MIN_LENGTH,
        maxlength: MOBILE_MAX_LENGTH
    },

    // Create full phone number if it exist
    phoneNumber: {
        ...stringProps,
        minlength: COUNTRY_CODE_MIN_LENGTH + MOBILE_MIN_LENGTH,
        maxlength: COUNTRY_CODE_MAX_LENGTH + MOBILE_MAX_LENGTH
    },

    // Current status of the law firm 
    status: {
        type: String,
        enum: Object.values(FirmStatus),
        default: FirmStatus.INACTIVE,
        index: true
    },

    firmType: {
        type: String,
        enum: Object.values(FirmType),
        default: FirmType.ADMIN,
        index: true
    },

    // Email verified 
    isEmailVerified: {
        type: Boolean,
        default: false
    },

    emailVerificationOtp: {
        type: Number,
        default: 0
    },
    emailOtpGeneratedTime: {
        type: Date,
    },
    // Email Verification attempts
    emailVerificationAttempts: {
        ...numberProps
    },
    forgotPasswordToken: {
        ...stringProps,
        default: ''
    },

    forgotPasswordTokenGenerationTime: {
        type: Date,
    },
    // Phone verified
    isPhoneVerified: {
        type: Boolean,
        default: false
    },

    phonelVerificationOtp: {
        type: Number,
        default: 0
    },
    phoneOtpGeneratedTime: {
        type: Date,
    },

    // Phone verification Attempts
    phoneVerificationAttempts: {
        ...numberProps
    },
    roles: [roleSchema],
    createdBy: {
        type: Types.ObjectId,
        index: true
    },
    casesAdded: {
        type: Number,
        default: 0
    },
    clientsAdded: {
        type: Number,
        default: 0
    }

    // Define roles and permissions

}, { timestamps: true, collation: { locale: 'en', strength: 2 } });




export const FirmModel = model<IFirm>('Firm', firmSchema);
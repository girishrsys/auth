
import { Document, Schema, Model, model, Types } from "mongoose"
import { stringProps, emailProps, COUNTRY_CODE_MIN_LENGTH, COUNTRY_CODE_MAX_LENGTH, MOBILE_MIN_LENGTH, MOBILE_MAX_LENGTH } from "../constants";
import { SessionStatus } from "../enums";

export interface IFirmSession extends Document {
    _id: string;
    firmId: string;
    status: SessionStatus;
    tokenRefreshedBeforeExpiry: number;
    tokenRefreshedAt: Date;
    invalidTokenReason: string;
    loggedOutAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class FirmSession {
    _id?: string;
    firmId: string;
    status?: SessionStatus;
    tokenRefreshedBeforeExpiry?: number;
    tokenRefreshedAt?: Date;
    invalidTokenReason?: string;
    loggedOutAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}


const firmSessionSchema: Schema = new Schema({


    firmId: {
        type: Types.ObjectId,
        index: true
    },

    status: {
        type: String,
        enum: Object.values(SessionStatus)
    },

    tokenRefreshedBeforeExpiry: {
        type: Number,
    },
    tokenRefreshedAt: {
        type: Date,
        default: Date.now()
    },

    invalidTokenReason: {
        ...stringProps,
        default: ''
    },
    loggedOutAt: {
        type: Date,
        default: Date.now()
    }

}, { timestamps: true });


export const FirmSessionModel = model<IFirmSession>('FirmSession', firmSessionSchema);
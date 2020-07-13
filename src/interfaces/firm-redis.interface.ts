import { SessionStatus, FirmStatus, FirmStatusType } from "../enums";


export interface FirmInstanceRedis {
    email: string;
    status: FirmStatusType,
    isEmailVerified: boolean;
}


export interface FirmSessionInstanceRedis {
    invalidTokenReason?: string;
    status: any;
    firmId: string;
    tokenRefreshedBeforeExpiry?: number;
    tokenRefreshedAt?: Date;
}
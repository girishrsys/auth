import { FirmType, FirmRoles, FirmRoleActions } from "../enums";
import { Roles, FirmPermission } from "../models";


export interface ITokenPayload {
    firmId?: string;
    isFirmVerified?: boolean;
    tokenDetail?: string;
    iat: number;
    exp: number;
    parentId: string;
    firmType: FirmType;
    roles: RolesPermissionJWT
}

export interface RolesPermissionJWT {
    billing: FirmPermission;
    subAdmin: FirmPermission;
}
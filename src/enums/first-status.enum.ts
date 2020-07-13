

export enum FirmStatus {
    INACTIVE = 'inactive',
    ACTIVE = 'active',
    BLOCKED = 'blocked',
    DELETED = 'deleted'
}

export enum FirmType {
    ADMIN = 'admin',
    EMPLOYEE = 'employee'
}

export enum FirmRoles {
    SUB_ADMIN = 'subAdmin',
    BILLING = 'billing'
}

export enum FirmRoleActions {
    CREATE = 'add',
    EDIT = 'edit',
    DELETE = 'delete',
    READ = 'read',
    BLOCK = 'block'

}

export type FirmStatusType = 'inactive' | 'active' | 'blocked' | 'deleted';
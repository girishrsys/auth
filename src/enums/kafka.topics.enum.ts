

export enum KAFKA_PRODUCERS {

    FIRM_SIGNUP = 'FIRM_SIGNUP',
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
    SIGNUP_EMPLOYEE = 'SIGNUP_EMPLOYEE',
    EMPLOYEE_BLOCKED = 'EMPLOYEE_BLOCKED',
    EMPLOYEE_UNBLOCKED = 'EMPLOYEE_UNBLOCKED',
    EMPLOYEE_DELETED = 'EMPLOYEE_DELETED',
    // Employee Name change include the change in name of law firm employee who have created the profile or 
    // Emplooyee those have been created by the super admin
    EMPLOYEE_NAME_CHANGED = 'EMPLOYEE_NAME_CHANGED',
    // Client profile update includes change in name,alien number and Profile Pic for kafka topics
    CLIENT_PROFILE_UPDATED = 'CLIENT_PROFILE_UPDATED',
    // Case Detail changed
    CASE_DETAIL_UPDATED = 'CASE_DETAIL_UPDATED'
}




export interface PayloadProducer {
    email: string;
    name: string;
    countryCode?: string;
    mobileNumber?: string;
}

export interface SignupProducer extends PayloadProducer {
    organizationName: string;
    otp: number;
}

export interface ForgotPasswordProducer extends PayloadProducer {
    organizationName: string;
    forgotPasswordToken?: string;
}

export interface EmployeeSignupProducer extends PayloadProducer {
    status: string;
    password: string;
}

export interface EmployeeBlockProducer extends PayloadProducer {
    employeeId: string;

}

export interface EmployeeUnblockProducer extends PayloadProducer {
    employeeId: string;
}

export interface EmployeeDeletedProducer {
    employeeId: string;
}

export interface EmployeeNameChangedProducer {
    employeeId: string;
    name: string;
}



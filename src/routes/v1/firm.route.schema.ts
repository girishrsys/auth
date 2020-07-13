
import { object } from 'joi';
import { ApiModel, ApiModelProperty, SwaggerDefinitionConstant } from "swagger-express-ts";
import { JOI_NAME, JOI_MOBILE_NUMBER, JOI_COUNTRY_CODE, JOI_EMAIL, JOI_NUMBER, JOI_EMAIL_OPTIONAL, JOI_PROFILE_PIC } from '../../constants/joi-validators.constant';

// ------------------------------------------------------//
/**
 * Swagger documentation for the signup request 
 * as well as Schema for validation for the Request
 */
@ApiModel({
    description: "Signup Request",
    name: "ReqFirmSignupPost"
})
export class ReqFirmSignupPost {

    @ApiModelProperty({
        description: "Name of the organization",
        type: SwaggerDefinitionConstant.STRING,
        example: 'E law Agency' as any
    })
    organizationName: string;

    @ApiModelProperty({
        description: "Name of the person who is registring the firm",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: 'Sukhdeep Singh' as any
    })
    name: string;

    @ApiModelProperty({
        description: "Email for login and primary contact",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: 'someemail@gmail.com' as any
    })
    email: string;

    @ApiModelProperty({
        description: "Country code for calling",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: "+91" as any
    })
    countryCode: string;


    @ApiModelProperty({
        description: "Mobile number",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: '123987348' as any
    })
    mobileNumber: string;

    @ApiModelProperty({
        description: "Password",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: 'SomePassword@982' as any
    })
    password: string;
}

export const Firm_Signup_Post_Schema = object().keys({
    organizationName: JOI_NAME,
    name: JOI_NAME.required(),
    email: JOI_EMAIL.required(),
    countryCode: JOI_COUNTRY_CODE.required(),
    mobileNumber: JOI_MOBILE_NUMBER.required(),
    password: JOI_NAME.required()
});

// ------------------------------------------------------//


@ApiModel({
    description: "Forgot Password Request",
    name: "ReqFirmVerifyEmailPatch"
})
export class ReqFirmVerifyEmailPatch {
    @ApiModelProperty({
        description: "Otp that has been sent to your registred email",
        required: true,
        type: SwaggerDefinitionConstant.NUMBER,
        example: 123211 as any
    })
    otp: number;
}
export const Firm_Verify_Email_Patch_Schema = object().keys({
    otp: JOI_NUMBER.min(10000).max(999999).required(),
});

// ------------------------------------------------------//

@ApiModel({
    description: "Forgot Password Request",
    name: "ReqFirmForgotPasswordPost"
})
export class ReqFirmForgotPasswordPost {
    @ApiModelProperty({
        description: "Email for login and primary contact",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: 'someemail@gmail.com' as any
    })
    email: string;
}
export const Firm_Forgot_Password_Post_Schema = object().keys({
    email: JOI_EMAIL.required(),
});


// ------------------------------------------------------//

@ApiModel({
    description: "Validate token get request",
    name: "ReqFirmValidateForgotTokenGet"
})
export class ReqFirmValidateForgotTokenGet {
    token: string;
}
export const Firm_Validate_Forgot_Token_Get_Schema = object().keys({
    token: JOI_NAME.required()
});

// ------------------------------------------------------//

@ApiModel({
    description: "Reset Password Request",
    name: "ReqFirmResetPasswordPatch"
})
export class ReqFirmResetPasswordPatch {
    @ApiModelProperty({
        description: "Password",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: 'dasjsd@asd' as any
    })
    password: string;
    token: string;
}
export const Firm_Reset_Password_Post_Schema = object().keys({
    password: JOI_NAME.required(),
    token: JOI_NAME.required()
});

// ------------------------------------------------------//


@ApiModel({
    description: "Request model for login Firm",
    name: "ReqFirmLoginPost"
})
export class ReqFirmLoginPost {
    @ApiModelProperty({
        description: "Email for login and primary contact",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: 'someemail@gmail.com' as any
    })
    email: string;

    @ApiModelProperty({
        description: "Password",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: 'SomePassword@982' as any
    })
    password: string;
}
export const Firm_Login_Post_Schema = object().keys({
    email: JOI_EMAIL.required(),
    password: JOI_NAME.required()
});

// ------------------------------------------------------//



@ApiModel({
    description: "Request model for login Firm",
    name: "ReqFirmRereshTokenGet"
})
export class ReqFirmRereshTokenGet {
    @ApiModelProperty({
        description: "Request for authorizing the user",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: 'askjdlksajdlkasjdlksajd' as any
    })
    refreshToken: string;

}
export const Firm_Authorize_Get_Schema = object().keys({
    refreshToken: JOI_NAME.required()
});

// ------------------------------------------------------//

@ApiModel({
    description: "Model for request Validate",
    name: "ReqFirmValidateEmailGet"
})
export class ReqFirmValidateEmailGet {
    @ApiModelProperty({
        description: "Request for checking the exstence  the user",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: 'askjdlksajdlkasjdlksajd' as any
    })
    email: string;

}
export const Firm_Validate_Phone_Schema = object().keys({

    countryCode: JOI_COUNTRY_CODE.required(),
    mobileNumber: JOI_MOBILE_NUMBER.required()
});


// ------------------------------------------------------//


@ApiModel({
    description: "Model for request Validate",
    name: "ReqFirmValidateEmailGet"
})
export class ReqFirmValidatePhoneGet {
    @ApiModelProperty({
        description: "Country code for calling",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: "+91" as any
    })
    countryCode: string;


    @ApiModelProperty({
        description: "Mobile number",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: '123987348' as any
    })
    mobileNumber: string;

}
export const Firm_Validate_Email_Schema = object().keys({
    email: JOI_EMAIL.required()
});



@ApiModel({
    description: "Model for edit Profile",
    name: "ReqFirmEditPatch"
})
export class ReqFirmEditPatch {
    @ApiModelProperty({
        description: "Name of the organization",
        type: SwaggerDefinitionConstant.STRING,
        example: 'E law Agency' as any,
        required: false
    })
    organizationName: string;

    @ApiModelProperty({
        description: "Name of the employee or the firm",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: 'Sukhdeep Singh' as any
    })
    name: string;


    @ApiModelProperty({
        description: "Profile Picture",
        required: false,
        type: SwaggerDefinitionConstant.STRING,
        example: 'Sukhdeep Singh' as any
    })
    profilePic: string;

    @ApiModelProperty({
        description: "Country code for calling",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: "+91" as any
    })
    countryCode: string;


    @ApiModelProperty({
        description: "Mobile number",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: '123987348' as any
    })
    mobileNumber: string;
}

export const Firm_Edit_Patch_Schema = object().keys({
    organizationName: JOI_NAME.empty().allow(''),
    name: JOI_NAME.required(),
    email: JOI_EMAIL_OPTIONAL,
    countryCode: JOI_COUNTRY_CODE.optional().empty().allow(''),
    mobileNumber: JOI_MOBILE_NUMBER.optional().empty().allow(''),
    profilePic: JOI_PROFILE_PIC
});


@ApiModel({
    description: "Model for Change Password",
    name: "ReqFirmChangePasswordPatch"
})
export class ReqFirmChangePasswordPatch {
    @ApiModelProperty({
        description: "Old password",
        type: SwaggerDefinitionConstant.STRING,
        example: 'SomePassword@123' as any,
        required: true
    })
    oldPassword: string;

    @ApiModelProperty({
        description: "New password",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: 'NewPassword@123' as any
    })
    newPassword: string;
}

export const Firm_Change_Password_Patch_Schema = object().keys({
    oldPassword: JOI_NAME.required(),
    newPassword: JOI_NAME.required()
});

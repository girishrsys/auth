
import { object, boolean, extend } from 'joi';
import { ApiModel, ApiModelProperty, SwaggerDefinitionConstant } from "swagger-express-ts";
import { JOI_NAME, JOI_MOBILE_NUMBER, JOI_COUNTRY_CODE, JOI_EMAIL, JOI_NUMBER, JOI_BOOLEAN, JOI_MONGO_ID, JOI_NAME_OPTIONAL, JOI_PROFILE_PIC } from '../../constants/joi-validators.constant';
import { FirmStatus } from '../../enums';
import { pagination, ReqPagination } from '../common.schema';
import { DEFALT_LIMIT_PAGINATION, MAX_LIMIT_PAGINATION } from '../../constants';
import * as joi from 'joi'
// ------------------------------------------------------//
/**
 * Swagger documentation for the signup request 
 * as well as Schema for validation for the Request
 */

@ApiModel({
    description: "Signup Request",
    name: "SubAdminPermission"
})
export class SubAdminPermission {

    @ApiModelProperty({
        description: "Can create sub admin",
        type: SwaggerDefinitionConstant.BOOLEAN,
        example: true as any
    })
    create: string;

    @ApiModelProperty({
        description: "Can edit the sub admins",
        type: SwaggerDefinitionConstant.BOOLEAN,
        example: true as any
    })
    edit: string;

    @ApiModelProperty({
        description: "Can block other subadmins",
        type: SwaggerDefinitionConstant.STRING,
        example: true as any
    })
    block: string;

}

@ApiModel({
    description: "Signup Request",
    name: "ReqEmployeeSignupPost"
})
export class ReqEmployeeSignupPost {

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

    @ApiModelProperty({
        description: "Password",
        required: true,
        type: SwaggerDefinitionConstant.OBJECT,
        model: 'SubAdminPermission'
    })
    subAdmin: SubAdminPermission

    @ApiModelProperty({
        description: "Password",
        required: true,
        type: SwaggerDefinitionConstant.BOOLEAN,
        example: true as any
    })
    showBilling: boolean

    @ApiModelProperty({
        description: "Current Status",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: 'active' as any
    })
    status: string;

    @ApiModelProperty({
        description: "S3 Url for profile picture",
        required: true,
        type: SwaggerDefinitionConstant.STRING,
        example: 'active' as any
    })
    profilePic: string
}

export class ReqEmployeeSignupPatch extends ReqEmployeeSignupPost {
    id: string;
}

@ApiModel({
    description: "Get employees",
    name: "ReqEmployeesGet"
})
export class ReqEmployeesGet extends ReqPagination {
    status: string;
}


export class ReqEmployeeDetailGet {
    id: string;
}

const SubAdminSchema = object().keys({
    create: JOI_BOOLEAN.optional().default(false),
    edit: JOI_BOOLEAN.optional().default(false),
    block: JOI_BOOLEAN.optional().default(false)
});
export const Employee_Signup_Post_Schema = object().keys({
    name: JOI_NAME.required(),
    email: JOI_EMAIL.required(),
    countryCode: JOI_COUNTRY_CODE.required(),
    profilePic: JOI_PROFILE_PIC,
    mobileNumber: JOI_MOBILE_NUMBER.required(),
    password: JOI_NAME.required(),
    showBilling: JOI_BOOLEAN.default(false).required(),
    subAdmin: SubAdminSchema,
    status: JOI_NAME.valid(FirmStatus.ACTIVE, FirmStatus.BLOCKED)
});

export const Employee_Signup_Patch_Schema = object().keys({
    id: JOI_MONGO_ID,
    name: JOI_NAME.required(),
    email: JOI_EMAIL.optional(),
    profilePic: JOI_PROFILE_PIC,
    countryCode: JOI_COUNTRY_CODE.optional(),
    mobileNumber: JOI_MOBILE_NUMBER.optional(),
    password: JOI_NAME.optional(),
    showBilling: JOI_BOOLEAN.default(false).optional(),
    subAdmin: SubAdminSchema,
    status: JOI_NAME.valid(FirmStatus.ACTIVE, FirmStatus.BLOCKED)
});



export const Employee_Get_Schema = object().keys({
    ...pagination,
    status: JOI_NAME_OPTIONAL.valid(FirmStatus.ACTIVE, FirmStatus.BLOCKED)
});

export const Employee_Dashboard_Schema = object().keys({
   text:joi.string().min(3)
});

export const Employee_Detail_Get_Schema = object().keys({
    id: JOI_MONGO_ID
});

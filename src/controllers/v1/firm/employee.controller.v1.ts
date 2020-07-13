import { IFilteredRequest } from "../../../interfaces";
import { ReqEmployeeSignupPost, ReqEmployeeSignupPatch, ReqEmployeesGet, ReqEmployeeDetailGet } from "../../../routes/v1/employee.route.schema";
import { NextFunction, Response } from "express";
import { BaseController } from "../../base.controller";
import { firmServiceV1 } from "../../../services";
import { FIRM_EXIST_ERROR, SERVICE_UNAVILABLE_ERROR, SUCCESS_RESPONSE, FIRM_NOT_EXIST_ERROR } from "../../../constants";
import { employeeServiceV1 } from "../../../services/employee.service";
import { ApiPath, ApiOperationPost, SwaggerDefinitionConstant, ApiOperationPatch, ApiOperationGet, ApiOperationDelete } from "swagger-express-ts";
import { paginationDoc } from "../../../routes";

@ApiPath({
    path: "/api/v1/employee",
    name: "Employee",
    security: { apiKeyHeader: [] },
})

export class EmployeeControllerV1 extends BaseController {

    constructor() {
        super();
    }

    @ApiOperationPost({
        description: "Api to signup for Employee",
        parameters: {
            body: {
                description: 'Body for the signup request for Employee',
                model: 'ReqEmployeeSignupPost'
            }
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })
    async signupEmployee(req: IFilteredRequest<ReqEmployeeSignupPost>, res: Response, next: NextFunction) {
        try {
            const firms = await firmServiceV1.checkIfFirmExist(req.data);
            if (firms.length > 0) {
                return this.sendResponse(res, FIRM_EXIST_ERROR, {});
            } else {
                await firmServiceV1.deleteUnverifiedFirms(req.data);
            }
            const newEmployee = await employeeServiceV1.create(req.data, req.decodedData);

            if (newEmployee) {
                employeeServiceV1.sendEmailToEmployeeSignup(newEmployee, req.data.password);
                return this.sendResponse(res, SUCCESS_RESPONSE,
                    firmServiceV1.firmDetailAfterEmployeeCreation(newEmployee));
            } else {
                return this.sendResponse(res, SERVICE_UNAVILABLE_ERROR);
            }

        } catch (err) {
            this.handleError(res, err);
        }
    }



    @ApiOperationPatch({
        description: "Api to edit Employee",
        path: "/{id}",
        parameters: {
            path: {
                id: {
                    description: 'Employee id',
                    type: SwaggerDefinitionConstant.STRING,
                    required: true
                }
            },
            body: {
                description: 'Body for the edit request for Employee',
                model: 'ReqEmployeeSignupPost'
            }
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })
    async editEmployee(req: IFilteredRequest<ReqEmployeeSignupPatch>, res: Response, next: NextFunction) {
        try {

            const firmUdpate = await employeeServiceV1.editEmployee(req.data, req.decodedData.roles);

            return this.sendResponse(res, SUCCESS_RESPONSE);
        } catch (err) {
            this.handleError(res, err);
        }
    }


    @ApiOperationGet({
        description: "Api to get the list of employees",
        parameters: {
            query: {
                ...paginationDoc
            }
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })
    async getEmployees(req: IFilteredRequest<ReqEmployeesGet>, res: Response, next: NextFunction) {
        try {
            const firmUdpate = await employeeServiceV1.getEmployees(req.data, req.decodedData);
            return this.sendResponse(res, SUCCESS_RESPONSE, firmUdpate);
        } catch (err) {
            this.handleError(res, err);
        }
    }

    @ApiOperationGet({
        description: "Api to get the list of employees",
        path:'/dashboard/employees',
        parameters: {
            query: {
                text:{
                    description:"text to search employee by name"
                }
            }
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })

    async getEmployeesDashboard(req, res: Response, next: NextFunction) {
        try {
            const employees = await employeeServiceV1.getEmployeeDashboard(req.data.text, req.decodedData);
            return this.sendResponse(res, SUCCESS_RESPONSE, employees);
        } catch (err) {
            this.handleError(res, err);
        }
    }


    @ApiOperationGet({
        description: "Api to get the detail employees",
        path: '/{id}',
        parameters: {
            path: {
                id: {
                    description: 'Employee id whose detail needs to be fetched',
                    required: true
                }
            }
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })
    async getEmployeeDetail(req: IFilteredRequest<ReqEmployeeDetailGet>, res: Response, next: NextFunction) {
        try {
            const employee = await firmServiceV1.firmDetail(req.data.id);

            if (!employee) {
                return this.sendResponse(res, FIRM_NOT_EXIST_ERROR);
            }
            return this.sendResponse(res, SUCCESS_RESPONSE, firmServiceV1.getFirmDataForResponse(employee));
        } catch (err) {
            this.handleError(res, err);
        }
    }

    @ApiOperationDelete({
        description: "Api to get the delete employees",
        path: '/{id}',
        parameters: {
            path: {
                id: {
                    description: 'Employee id which needs to be deleted',
                    required: true
                }
            }
        },
        responses: {
            200: {
                description: "Success",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            }
        },
    })

    async deleteEmployee(req: IFilteredRequest<ReqEmployeeDetailGet>, res: Response, next: NextFunction) {
        try {
            const employee = await employeeServiceV1.deleteEmployee(req.data.id, req.decodedData.parentId);

            if (!employee) {
                return this.sendResponse(res, FIRM_NOT_EXIST_ERROR);
            }
            return this.sendResponse(res, SUCCESS_RESPONSE);
        } catch (err) {
            this.handleError(res, err);
        }
    }


}

export const employeeControllerV1 = new EmployeeControllerV1();
import { BaseRoute } from "../base.routes";
import { Request, Response, NextFunction } from "express";
import { firmControllerV1 } from "../../controllers/v1/firm/firm.controller.v1";
import { validateRequest, AuthorizationMiddleware } from "../../middlewares";
import { Employee_Signup_Post_Schema, Employee_Get_Schema, Employee_Signup_Patch_Schema, Employee_Detail_Get_Schema, Employee_Dashboard_Schema } from "./employee.route.schema";
import { employeeControllerV1 } from "../../controllers/v1";
import { FirmPermission } from "../../models";
import { FirmRoles, FirmRoleActions } from "../../enums";

class EmployeeRoutesV1 extends BaseRoute {

    public path = '/employee';

    constructor() {
        super();
        this.init();
    }

    private init() {
        // Create new Employee
        this.router.post('/',
            validateRequest(Employee_Signup_Post_Schema),
            AuthorizationMiddleware.checkRequestAuthentication,
            // AuthorizationMiddleware.checkPermission(FirmRoles.SUB_ADMIN, FirmRoleActions.CREATE),
            (req: Request, res: Response, next: NextFunction) => {
                employeeControllerV1.signupEmployee(req, res, next);
            });

        this.router.get('/',
            validateRequest(Employee_Get_Schema),
            AuthorizationMiddleware.checkRequestAuthentication,
            // AuthorizationMiddleware.checkPermission(FirmRoles.SUB_ADMIN, FirmRoleActions.READ),
            (req: Request, res: Response, next: NextFunction) => {
                employeeControllerV1.getEmployees(req, res, next);
            });

            //// for dashboard

            this.router.get('/dashboard/employees',
            validateRequest(Employee_Dashboard_Schema),
            AuthorizationMiddleware.checkRequestAuthentication,
            // AuthorizationMiddleware.checkPermission(FirmRoles.SUB_ADMIN, FirmRoleActions.READ),
            (req: Request, res: Response, next: NextFunction) => {
                employeeControllerV1.getEmployeesDashboard(req, res, next);
            });

        this.router.patch('/:id',
            validateRequest(Employee_Signup_Patch_Schema),
            AuthorizationMiddleware.checkRequestAuthentication,
            // AuthorizationMiddleware.checkPermission(FirmRoles.SUB_ADMIN, FirmRoleActions.EDIT),
            (req: Request, res: Response, next: NextFunction) => {
                employeeControllerV1.editEmployee(req, res, next);
            });

        this.router.get('/:id',
            validateRequest(Employee_Detail_Get_Schema),
            AuthorizationMiddleware.checkRequestAuthentication,
            // AuthorizationMiddleware.checkPermission(FirmRoles.SUB_ADMIN, FirmRoleActions.READ),
            (req: Request, res: Response, next: NextFunction) => {
                employeeControllerV1.getEmployeeDetail(req, res, next);
            });

        this.router.delete('/:id',
            validateRequest(Employee_Detail_Get_Schema),
            AuthorizationMiddleware.checkRequestAuthentication,
            // AuthorizationMiddleware.checkPermission(FirmRoles.SUB_ADMIN, FirmRoleActions.DELETE),
            (req: Request, res: Response, next: NextFunction) => {
                employeeControllerV1.deleteEmployee(req, res, next);
            });
    }

}


export const employeeRoutesV1 = new EmployeeRoutesV1();
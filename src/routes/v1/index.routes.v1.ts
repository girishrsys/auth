import { BaseRoute } from "../base.routes";
import { firmRoutesV1 } from "./firm.routes.v1";
import { employeeRoutesV1 } from "./employee.route.v1";


class ApiVersionRoutes extends BaseRoute {

    public path = '/v1';

    constructor() {
        super();
        this.init();
    }

    
    private init() {
        this.router.use(firmRoutesV1.path, firmRoutesV1.routerinstance);
        this.router.use(employeeRoutesV1.path, employeeRoutesV1.routerinstance);
    }
}


export const appRoutesV1 = new ApiVersionRoutes();
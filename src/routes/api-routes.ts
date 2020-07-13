import { appRoutesV1 } from "./v1/index.routes.v1";
import { BaseRoute } from "./base.routes";

/**
 * @name routes/index
 * @description Defines routing for the app
 * @author Sukhdeep Singh
 */

class ApiRoutes extends BaseRoute {

    public path = '/api';

    constructor() {
        super();
        this.init();
    }

    private init() {

        // Mount Version 1 routes on this path
        this.router.use(appRoutesV1.path, appRoutesV1.routerinstance);
        
    }

}


export const appAPI = new ApiRoutes();
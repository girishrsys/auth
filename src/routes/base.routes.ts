import { Router } from 'express';

export abstract class BaseRoute {

    constructor() { }
    protected router = Router();


    get routerinstance(): Router {
        return this.router;
    }
}
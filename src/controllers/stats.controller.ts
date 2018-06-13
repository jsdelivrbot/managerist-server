import {BaseController} from "../core/base.controller";
import { Managerist } from "../app";

export class StatsController extends  BaseController {
    constructor(app:any) {
        super(app, [{
                route: '/',
                method: 'get',
                handler: 'actionStatus'
            }, {
                route: '/status',
                method: 'get',
                handler: 'actionStatus'
            }
        ]);
    }

    actionStatus = (req: any, res: any, next: any):any => {
        res.json({
            ready:Managerist.app.isReady
        });
    }
}
import {Employee} from "../../models/employee";
import {BaseGameController} from "../base.game.controller";
import {Company} from "../../models";
import {DepartmentStatsInterface, DepartmentStats} from "../../models/company/departments/stats";
import {DepartmentAlerts} from "../../models/company/departments/alerts";
import {Alert} from "../../models/alerts/alert";

export abstract class GameDepartmentsController extends BaseGameController {
    protected abstract _statsClass:DepartmentStatsInterface;
    protected _stats:DepartmentStats;

    constructor(app:any, routes:any[]) {
        super(app, routes.concat([
            {
                route: '/alerts',
                method: 'get',
                handler: 'actionAlerts'
            },
            {
                route: '/team',
                method: 'get',
                handler: 'actionTeam'
            },
        ]));
    }

    protected _prepare(): Promise<boolean> {
        return this.company
            .then((c:Company) => this._stats = (new this._statsClass(c)))
            .then(() => this._stats.init());
    }

    /**
     * actionHireable
     *
     * HR: Get list of awailable for hiring
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    actionAlerts = (req: any, res: any, next: any):any => {
        return this._prepare()
            .then(() => <any>this._stats.alertsStorage.alerts())
            .then((alerts:Alert[]) => {
                return res.json(alerts.map((a:any) => a.common));
            });
    }

    actionTeam = (req: any, res: any, next: any) => {
        return this._prepare()
            .then(() => this._stats.employees)
            .then((employees:Employee[]) => res.json(employees.map((e:any) => e.common)));
    }
}

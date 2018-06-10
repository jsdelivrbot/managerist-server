import {Employee} from "../../models/employee";
import {BaseGameController} from "../base.game.controller";
import {Company} from "../../models";
import {DepartmentStatsInterface, DepartmentStats} from "../../models/company/departments/stats";
import {DepartmentAlerts} from "../../models/company/departments/alerts";
import {Alert} from "../../models/alerts/alert";
import { SetHeadActionType } from "../../models/actions/types/set.head.actiontype";

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
            {
                route: '/head',
                method: 'get',
                handler: 'actionHead'
            },
            {
                route: '/head',
                method: 'post',
                handler: 'actionSetHead'
            },
        ]));
    }

    protected _prepare(): Promise<boolean> {
        return this.game
            .then(() => this.company)
            .then((c:Company) => this._stats = (new this._statsClass(c)))
            .then(() => this._stats.init());
    }

    /**
     * actionAlerts
     *
     * Get list of departments alerts
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

    /**
     * actionTeam
     * 
     * Get list of employees of certain department
     * 
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    actionTeam = (req: any, res: any, next: any) => {
        return this._prepare()
            .then(() => this._stats.employees)
            .then((employees:Employee[]) => res.json(employees.map((e:any) => e.common)));
    }

    /**
     * actionHead
     * 
     * Get head of department
     * 
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    actionHead = (req: any, res: any, next: any) => {
        return this._prepare()
            .then(() => this._stats.employees)

            .then((employees:Employee[]) => {
                // TODO
                res.json(employees[0] || null);
            });
    }

    /**
     * actionSetHead
     * 
     * Set head of department
     * 
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    actionSetHead = (req: any, res: any, next: any) => {
        return this._prepare()
            .then(() => this._processActionCreation(req, res,
                (new SetHeadActionType(this.ga)).do({
                    date: this._game.common.simulationDate,
                    company: this._company._id,
                    employee: req.body._employee,
                    department: req.body._deprtment,
                })
            ));
    }
}

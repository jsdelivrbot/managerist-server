import {Employee} from "../../models/employee";
import {BaseGameController} from "../base.game.controller";
import {Company} from "../../models";
import {DepartmentStatsInterface, DepartmentStats} from "../../models/company/departments/stats";
import {DepartmentAlerts} from "../../models/company/departments/alerts";
import {Alert} from "../../models/alerts/alert";
import { SetHeadActionType } from "../../models/actions/types/set.head.actiontype";
import { CompanyDepartment } from "../../models/company/departments/company.department";
import { Log, LogLevel } from "../../core/utils/log";
import { ESRCH } from "constants";

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
            {
                route: '/details',
                method: 'get',
                handler: 'actionDetails'
            }
        ]));
    }

    protected _prepare(): Promise<boolean> {
        this._company = this._game = null;
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
    public actionAlerts = (req: any, res: any, next: any):any => {
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
    public actionTeam = (req: any, res: any, next: any) => {
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
    public actionHead = (req: any, res: any, next: any) => {
        return this._prepare()
            .then(() => this._stats.employees)
            .then((employees:Employee[]) => {
                let statsDep = (this._stats && this._stats.department && this._stats.department._id) ||  '';
                let cDep:CompanyDepartment = 
                        this._company.departments.find(d => d.department.toString() == statsDep.toString()),
                    head = (cDep.head && employees.find(e => e._id.toString() == cDep.head.toString())) || null;
                Log.log("Start Dep ~ " + this.constructor.name + ' ' + statsDep, LogLevel.Info);
                res.status(head ? 200 : 204).send(head && head.common);
            })
            .catch(e => {
                Log.log(e, LogLevel.Error);
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
    public actionSetHead = (req: any, res: any, next: any) => {
        return this._prepare()
            .then(() => this._processActionCreation(req, res,
                (new SetHeadActionType(this.ga)).do({
                    date: this._game.common.simulationDate,
                    company: this._company._id,
                    employee: req.body.employee,
                    department: this._stats.department,
                })
            ))
            .catch(e => {
                Log.log(e, LogLevel.Error);
            });
    }

    /**
     * actionDetails
     * 
     * Get details of department
     * 
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    public actionDetails = (req: any, res: any, next: any) => {
        return this._prepare()
            .then(() => {
                let statsDep = (this._stats && this._stats.department && this._stats.department._id) ||  '',
                    cDep:CompanyDepartment = 
                        this._company.departments.find(
                            d => d.department.toString() == statsDep.toString()
                        );
                Log.log("Details "+this.constructor.name, LogLevel.Warning);
                res.status(cDep ? 200 : 204).send(cDep && cDep.common);
            })
            .catch(e => {
                Log.log(e, LogLevel.Error);
            });
    }    
}

import {Employee} from "../../models/employee";
import {ResignmentActionType, AssignmentActionType, DismissalActionType, HireActionType} from "../../models/actions";
import {BaseGameController} from "../base.game.controller";
import {Game} from "../../models/game";
import {Company} from "../../models/company";
import {Action} from "../../models/actions/action";
import {HrCompanyDepartment} from "../../models/company/departments/hr/department";
import {Role} from "../../models/role";
import {RecruitmentPriorityActionType} from "../../models/actions/types/recruitment.priority.actiontype";

/**
 * Class GameHrController
 */
export class GameHrController extends BaseGameController {
    constructor(app:any) {
        super(app,[
            {
                route: '/role/list',
                method: 'get',
                handler: 'actionRoles'
            },
            {
                route: '/priority',
                method: 'post',
                handler: 'actionPrioritize'
            },
            {
                route: '/assign',
                method: 'post',
                handler: 'actionAssign'
            }, {
                route: '/resign',
                method: 'post',
                handler: 'actionResign'
            }, {
                route: '/dismiss',
                method: 'post',
                handler: 'actionDismiss'
            }, {
                route: '/hire',
                method: 'post',
                handler: 'actionHire'
            }, {
                route: '/hireable',
                method: 'get',
                handler: 'actionHireable'
            }
        ]);
    }

    /**
     * actionRoles
     *
     * return the list of available employees roles
     *
     * @param req
     * @param res
     * @param next
     * @return {Promise<TResult>}
     */
    actionRoles = (req: any, res: any, next: any) => {
        return (new Role())
            .findAll()
            .then((roles:any[]) => {
                res.json(roles.map((r:any) => r.common));
            })
            .catch((err:any) => {
                res.status(500).send(err.message);
            });
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @return {any}
     */
    actionPrioritize = (req: any, res: any, next: any) => {
        let g:Game,
            c:Company;
        return this._processActionCreation(req, res,
            this.game
                .then((_g:Game) => g = _g)
                .then(() => this.company)
                .then((_c:Company) => c = _c)
/*                .then(() => {
                    console.log("SET PRIORITY:", req.body.roles);
                    c.hrDepartment.priority = req.body.roles || null;
                    return c.save();
                })
*/                .then(() =>
                    (new RecruitmentPriorityActionType(this.ga)).do({
                        date: g.common.simulationDate,
                        company: c._id,
                        roles: req.body.roles || null
                    })
                )
        );
    }

    /**
     * HR: Assign employee to Product/Project (TODO: role)
     *
     * @param req
     * @param res
     * @param next
     */
    actionAssign = (req: any, res: any, next: any) => {
        return this.game.then((g:Game) =>
            this._processActionCreation(req, res,
                (new AssignmentActionType(this.ga)).do({
                    date: g.common.simulationDate,
                    company: req.body.company,
                    project: req.body.project,
                    product: req.body.product,
                    employee: req.body._id,
                })
            )
        );
    }

    /**
     * HR: Resign employee to the pool in void
     *
     * @param req
     * @param res
     * @param next
     */
    actionResign = (req: any, res: any, next: any) => {
        return this.game.then((g:Game) =>
            this._processActionCreation(req, res,
                (new ResignmentActionType(this.ga)).do({
                    date: g.common.simulationDate,
                    company: req.body.company,
                    project: null,
                    product: null,
                    employee: req.body._id,
                })
            )
        );
    }

    /**
     * HR: Dismiss employee
     *
     * @param req
     * @param res
     * @param next
     */
    actionDismiss = (req: any, res: any, next: any) => {
        return this.game.then((g:Game) =>
            this._processActionCreation(req, res,
                (new DismissalActionType(this.ga)).do({
                    date: g.common.simulationDate,
                    company: req.body.company,
                    employee: req.body._id,
                })
            )
        );
    }

    /**
     * HR: Dismiss employee
     *
     * @param req
     * @param res
     * @param next
     */
    actionHire = (req: any, res: any, next: any) => {
        return this.company.then((c:Company) =>
            this.game.then((g:Game) =>
                this._processActionCreation(req, res,
                    (new HireActionType(this.ga)).do({
                        date: g.common.simulationDate,
                        company: c._id,
                        employee: req.body._id,
                    })
                )
            )
        );
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
    actionHireable = (req: any, res: any, next: any) => {
        return this.company.then((c:Company) => {
            console.log('COMPANY FOUND: ', c.name);
            return (new Employee(c.ga)).withRelations(['role']).findAll({visible: c._id})
        })
            .then((employees:any[]) => {
                console.log('EMPLOYEES FOUND: ' + employees.length);
                res.json(employees.map((e:any) => e.common));
            })
            .catch((err:any) => {
                res.status(500).send(err.message);
            });
    }
}

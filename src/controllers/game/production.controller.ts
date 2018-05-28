import {GameDepartmentsController} from "./departments.controller";
import {ProductionStats} from "../../models/company/departments/production/stats";
import {DepartmentStatsInterface} from "../../models/company/departments/stats";
import {EstimateActionType} from "../../models/actions/types/production/estimate.actiontype";
import {Game} from "../../models/game";
import {Project} from "../../models/project";

/**
 * Class GameProductionController
 *
 * Controller /game/production
 */
export class GameProductionController extends GameDepartmentsController {
    protected _statsClass:DepartmentStatsInterface = ProductionStats;
    constructor(app:any) {
        super(app, [
            {
                route: '/project/list',
                method: 'get',
                handler: 'actionProjects'
            },
            {
                route: '/project/estimate',
                method: 'post',
                handler: 'actionEstimate'
            },
        ]);
    }

    /**
     * actionProjects
     *
     * return the list of available employees roles
     *
     * @param req
     * @param res
     * @param next
     * @return {Promise<TResult>}
     */
    actionProjects = (req: any, res: any, next: any) => {
        return this.company
            .then(() => new Project(this.ga).findAll({company: this._company._id}))
            .then((projects:any[]) => {
                res.json(projects.map((p:any) => p.common));
            })
            .catch((err:any) => {
                res.status(500).send(err.message);
            });
    }

    /**
     * Production: Estimate project
     *
     * @param req
     * @param res
     * @param next
     */
    actionEstimate = (req: any, res: any, next: any) => {
        return this.company
            .then(() => this.game)
            .then((g:Game) =>
                this._processActionCreation(req, res,
                    (new EstimateActionType(this.ga)).do({
                        date: g.common.simulationDate,
                        company: req.body.company,
                        project: req.body.project,
                        employee: req.body.employee,
                    })
                )
            );
    }
}

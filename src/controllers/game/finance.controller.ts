import {GameDepartmentsController} from "./departments.controller";
import {DepartmentStatsInterface} from "../../models/company/departments/stats";
import {FinanceStats} from "../../models/company/departments/finance/stats";
import { Game } from "../../models/game";
import { Company } from "../../models";
import { TakeCreditActionType } from "../../models/actions/types/finance/take.credit.actiontype";
import { Credit } from "../../models/credit";

/**
 * Class GameFinanceController
 *
 * Controller /game/finance
 */
export class GameFinanceController extends GameDepartmentsController {
    protected _statsClass:DepartmentStatsInterface = FinanceStats;
    constructor(app:any) {
        super(app, [{
            route: '/credits',
            method: 'get',
            handler: 'actionCredits'
        },
        {
            route: '/loan',
            method: 'post',
            handler: 'actionLoan'
        }]);
    }

    /**
     * actionCredits
     *
     * return the list of existing credits
     *
     * @param req
     * @param res
     * @param next
     * @return {Promise<TResult>}
     */
    actionCredits = (req: any, res: any, next: any) => {
        return this.company
            .then((_c:Company) => 
                (new Credit(this.ga))
                    .findAll({
                        company: _c._id
                    })
            )
            .then((credits:any[]) => {
                res.json(credits.map((c:any) => c.common));
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
    actionLoan = (req: any, res: any, next: any) => {
        let g: Game, 
            c:Company;
        return this._processActionCreation(req, res,
            this.game
                .then((_g: Game) => g = _g)
                .then(() => this.company)
                .then((_c:Company) => c = _c)
                .then(() =>
                    (new TakeCreditActionType(this.ga)).do({
                        date: g.common.simulationDate,
                        company: c._id
                    })
                )
        );
    }    
}

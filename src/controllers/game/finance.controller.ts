import {GameDepartmentsController} from "./departments.controller";
import {DepartmentStatsInterface} from "../../models/company/departments/stats";
import {FinanceStats} from "../../models/company/departments/finance/stats";

/**
 * Class GameFinanceController
 *
 * Controller /game/finance
 */
export class GameFinanceController extends GameDepartmentsController {
    protected _statsClass:DepartmentStatsInterface = FinanceStats;
    constructor(app:any) {
        super(app, []);
    }
}

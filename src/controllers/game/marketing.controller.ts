import {GameDepartmentsController} from "./departments.controller";
import {DepartmentStatsInterface} from "../../models/company/departments/stats";
import {MarketingStats} from "../../models/company/departments/marketing/stats";

/**
 * Class GameMarketingController
 *
 * Controller /game/marketing
 */
export class GameMarketingController extends GameDepartmentsController {
    protected _statsClass:DepartmentStatsInterface = MarketingStats;
    constructor(app:any) {
        super(app, []);
    }
}

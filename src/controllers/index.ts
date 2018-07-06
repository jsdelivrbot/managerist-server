import * as express from 'express';
import {CompanyController} from './company.controller';
import {ProductController} from "./product.controller";
import {UserController} from "./user.controller";
import {ProjectController} from "./project.controller";
import {EmployeeController} from "./employee.controller";
import {AuthController} from "./auth.controller";

// Game controllers
import {GameController} from "./game/game.controller";
import {GameHrController} from "./game/hr.controller";
import {GameProductionController} from "./game/production.controller";
import {GameFinanceController} from "./game/finance.controller";
import {GameMarketingController} from "./game/marketing.controller";
import { StatsController } from './stats.controller';
import { DictController } from './game/dict.controller';

export function init(app: express.Application) {
    new StatsController(app);
    new DictController(app);

    new CompanyController(app);
    new ProductController(app);
    new ProjectController(app);
    new EmployeeController(app);
    new UserController(app);
    new AuthController(app);

    new GameController(app);
    new GameHrController(app);
    new GameProductionController(app);
    new GameFinanceController(app);
    new GameMarketingController(app);
}

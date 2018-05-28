import {FinanceAlerts} from "../company/departments/finance/alerts";
import {Company} from "../company";
import {Alert} from "../alerts";
import {ProductionAlerts} from "../company/departments/production/alerts";
import {AlertResolver} from "./alert.resolver";

class Actor {
    private _financeAlerts:FinanceAlerts;
    private _productionAlerts:ProductionAlerts;
    private _alertResolver: AlertResolver;

    constructor(private _company: Company) {
        this._financeAlerts = new FinanceAlerts(this._company);
        this._productionAlerts = new ProductionAlerts(this._company);
        this._alertResolver = new AlertResolver();
    }

    /**
     *
     * @return Promise<Alert[]>
     */
    checkAlerts():Promise<Alert[]> {
        return Promise.all([
            this._financeAlerts.alerts(),
            this._productionAlerts.alerts(),
        ])
        .then((a:Alert[][]) => [].concat(...a));
    }

    /**
     *
     * @return {Promise<boolean>}
     */
    solveAlerts(): Promise<boolean> {
        return this.checkAlerts()
            .then((as:Alert[]) => Promise.all(
                as.map((a:Alert) => this.solveAlert)
            ))
            .then((res:boolean[]) => !res.find((b:boolean) => !b));
    }

    /**
     *
     * @param a Alert
     * @return {Promise<boolean>}
     */
    solveAlert(a:Alert):Promise<boolean> {
        return this._alertResolver.solve(a);
    }
}

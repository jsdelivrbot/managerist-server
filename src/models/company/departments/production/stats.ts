import {Company, CompanyFinancials} from "../../company";
import {Credit} from "../../../credit";
import {U} from "../../../../common/u";
import {Employee} from "../../../employee";
import {Department, KnownDepartments} from "../../../department";
import {KnownProductionAlerts, ProductionAlerts} from "./alerts";
import {DepartmentStats} from "../stats";
import {DepartmentAlertsInterface} from "../alerts";
import {CompanyDepartmentInterface} from "../company.department";
import {ProductionCompanyDepartment} from "./department";
import {AlertType} from "../../../alerts/alert.type";
import {Product} from "../../../product/product";
import {Project} from "../../../project/project";

/**
 * Class ProductionStats
 *
 */
export class ProductionStats extends DepartmentStats {
    protected static _departmentDetailsClass:CompanyDepartmentInterface = ProductionCompanyDepartment;
    protected static _alertsClass: DepartmentAlertsInterface = ProductionAlerts;

    protected _products:Product[];
    protected _projects:Project[];

    protected _employeeWorkload:number = 10;

    /**
     *
     * @param reload
     * @return {Promise<boolean>}
     */
    public init(reload:boolean = false):Promise<boolean> {
        if (!reload && this._initialized)
            return Promise.resolve(true);
        return this.employees
            .then(() => (new Product(this._company.ga)).findAll({company:this._company._id}))
            .then((prods:Product[]) => this._products = prods)
            .then(() => (new Project(this._company.ga)).findAll({product:this._products.map(p => p._id)}))
            .then((projs:Project[]) => this._projects = projs)
            .then(() => this.invalidateAlerts())
            .then(() => {
                return this._initialized = true;
            });
    }

    /**
     *
     * @returns {any}
     */
    invalidateAlerts():Promise<boolean> {
        let noDevAT = AlertType.getByName('NoDevelopers'),
            noDevATInvalidate:Function = this._depEmployees.length
                ? this._alerts.resolveKnown
                : this._alerts.throwKnown,
            notEstPrjAT = AlertType.getByName('NotEstimatedProject'),
            notEstPrjATInvalidate:Function = this._projects.find(p => !p.todo)
                ? this._alerts.throwKnown
                : this._alerts.resolveKnown;

        return noDevATInvalidate.call(this._alerts, noDevAT)
            .then(() => notEstPrjATInvalidate.call(this._alerts, notEstPrjAT));
    }


    /**
     * get workload
     *
     * return required numbers in man/hours for the month
     *
     * @returns {Promise<number>}
     */
    public get workload():Promise<number> {
        if (!this.isIninialized) throw new Error('ProductionStats not initialized');

        return Promise.resolve(
            U.sum(this._projects.map(p => p.todo))
        );
    }

    /**
     * get complexity
     *
     * return complexity of the processes
     *
     * @returns {Promise<number>}
     */
    public get complexity():Promise<number> {
        // TODO
        // 1. - link with project
        // 2. - company financials
        return this.allEmployees.then((emps) => {
            if (emps.length > 5)
                return 1.5;
            return 1;
        });
    }
}

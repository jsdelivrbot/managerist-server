import {Company, CompanyFinancials} from "../../company";
import {Credit} from "../../../credit";
import {U} from "../../../../common/u";
import {Employee} from "../../../employee";
import {FinanceAlerts} from "./alerts";
import {DepartmentStats} from "../stats";
import {DepartmentAlertsInterface} from "../alerts";
import {FinanceCompanyDepartment} from "./department";
import {CompanyDepartmentInterface} from "../company.department";

/**
 * Class FinanceStats
 *
 */
export class FinanceStats extends DepartmentStats {
    protected static _departmentDetailsClass:CompanyDepartmentInterface = FinanceCompanyDepartment;
    protected static _alertsClass: DepartmentAlertsInterface = FinanceAlerts;
    protected _employeeWorkload:number = 10;
    protected _companyFinancials:any = null;


    /**
     *
     * @returns {Promise<CompanyFinancials>}
     */
    public get companyFinancials():Promise<CompanyFinancials> {
        if (this._companyFinancials)
            return Promise.resolve(this._companyFinancials);

        return this.getCompanyFinancials();
    }

    /**
     * @returns {Promise<CompanyFinancials>}
     */
    public getCompanyFinancials():Promise<CompanyFinancials> {
        return this._company.getFinancials(this._company._id)
            .then((r: any) => this._companyFinancials = r);
    }

    /**
     * get workload
     *
     * return required numbers in man/hours for the month
     *
     * @returns {Promise<number>}
     */
    public get workload():Promise<number> {
        //noinspection TypeScriptValidateTypes
        return Promise.all([
            (new Credit(this._company.ga)).findAll({company:this._company._id})
                .then((cds:Credit[]|any[]) =>
                    (<Array<any>>cds).reduce((a:any, b:any):any => a.workload + b.workload, 0)
                ),
            this.allEmployees
                .then((emps:Employee[]) => emps.length * this._employeeWorkload)
        ])
            .then((wls:number[]) => U.sum(wls));
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

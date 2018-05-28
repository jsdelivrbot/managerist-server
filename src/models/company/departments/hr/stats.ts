import {Company, CompanyFinancials} from "../../company";
import {Credit} from "../../../credit";
import {U} from "../../../../common/u";
import {Employee} from "../../../employee";
import {Department, KnownDepartments} from "../../../department";
import {HrAlerts} from "./alerts";
import {DepartmentStats} from "../stats";
import {DepartmentAlertsInterface} from "../alerts";
import {HrCompanyDepartment} from "./department";
import {CompanyDepartmentInterface} from "../company.department";

/**
 * Class ProductionStats
 *
 */
export class HrStats extends DepartmentStats {
    protected static _departmentDetailsClass:CompanyDepartmentInterface = HrCompanyDepartment;
    protected static _alertsClass: DepartmentAlertsInterface = HrAlerts;
    protected _employeeWorkload:number = 15;

    private _recruitmentEfficiency:number = 0.1;
    private _retentionEfficiency:number = 0.1;

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
        return this.allEmployees.then((emps) => {
            if (emps.length > 5)
                return 1.5;
            return 1;
        });
    }

    /**
     * getter retention efficiency (maybe differ from Departmnts efficiency overall)
     *
     * @returns {Promise<number>} KPI (0-1)
     */
    public get retentionEfficiency(): Promise<number> {
        let capacity: any, workload: any;

        return this.efficiency;
    }

    /**
     * getter efficiency
     *
     * @returns {Promise<number>} KPI (0-1)
     */
    public get recruitmentEfficiency(): Promise<number> {
        // TODO
        return this.employees
            .then(() => this._employees.length * this._recruitmentEfficiency);
    }
}

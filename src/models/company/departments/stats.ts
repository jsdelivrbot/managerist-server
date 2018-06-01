import {Company, CompanyFinancials} from "../company";
import {U} from "../../../common/u";
import {Employee} from "../../employee";
import {Department, KnownDepartments} from "../../department";
import {DepartmentAlerts, DepartmentAlertsInterface} from "./alerts";
import {Alert} from "../../alerts/alert";
import {ExpertiseLevel} from "../../technology";
import {CompanyDepartmentInterface, CompanyDepartment} from "./company.department";

export interface DepartmentStatsInterface {
    new(_company:Company):DepartmentStats;
}

/**
 * Class DepartmentsStats
 *
 */
export abstract class DepartmentStats {
    protected static _departmentDetailsClass: CompanyDepartmentInterface;
    protected static _alertsClass: DepartmentAlertsInterface;

    protected _departmentDetails: CompanyDepartment;
    protected _alerts:DepartmentAlerts;
    protected _employees:Employee[] = []; // all company employees
    protected _employeeWorkload:number = 10;
    protected _depEmployees:Employee[] = []; // company employees in department
    constructor(protected _company:Company){
        if (!this._company._id)
            throw new Error('Not a full Company ');

        this._alerts = new ((<any>this.constructor)._alertsClass)(this._company);
        this._departmentDetails = new ((<any>this.constructor)._departmentDetailsClass);
    }

    protected _initialized:boolean = false;

    /**
     * @returns {boolean}
     */
    public get isIninialized():boolean {
        return this._initialized;
    }

    public static reloadCache() {
        // TODO
    }

    /**
     * @returns {DepartmentAlerts}
     */
    public get alertsStorage():DepartmentAlerts {
        return this._alerts;
    }

    /**
     *
     * @param {boolean} reload
     * @returns {Promise<boolean>}
     */
    public init(reload:boolean = false):Promise<boolean> {
        if (!reload && this._initialized)
            return Promise.resolve(true);

        let thisClass:Function = this.constructor;
        return  this.employees
            .then(() => {
                //Alert.onUpdates((<any>thisClass).reloadCache);
                return this._initialized = true;
            });
    }

    /**
     * allEmployees
     *
     * private method to preload and get all employees
     *
     * @return {Promise<Employee[]>}
     */
    protected get allEmployees():Promise<Employee[]|any[]> {
        if (this._employees.length)
            return Promise.resolve(this._employees);

        return (new Employee(this._company.ga)).withRelations(['role'])
            .findAll({company:this._company._id})
            .then((_emps:Employee[]|any[]) => {
                this._employees = _emps;
                return this._employees;
            });
    }

    /**
     * getter employees
     *
     * get all employees of Finance Department
     *
     * @return {any}
     */
    public get employees():Promise<Employee[]> {
        if (this._depEmployees.length)
            return Promise.resolve(this._depEmployees);

        return this.allEmployees
            .then(() => {
                let dep = this._departmentDetails.department;

                this._depEmployees = this._employees.filter((e: any|Employee) =>
                    (e.role.department._id || e.role.department).toString() == (dep._id || dep).toString()
                );
                return this._depEmployees;
            });
    }

    /**
     * getter efficiency
     *
     * return KPI (0-1)
     *
     * @returns {Promise<number>}
     */
    public get efficiency():Promise<number> {
        let capacity:any, workload:any;

        return this.capacity
            .then((_c) => {
                capacity = _c;
                return this.workload;
            })
            .then((_w) => workload = _w)
            .then(() => Math.min(1, workload ? capacity / workload : 0));
    }

    /**
     * get capacity
     *
     * return available numbers in man/hours
     *
     * @returns {Promise<number>}
     */
    public get capacity():Promise<number> {
        return this.employees
            .then((emps:Employee[]) => {
                let caps = emps.map((e) => {
                    return 22*6*((<any>{
                            [ExpertiseLevel.Intern]: 0.1,
                            [ExpertiseLevel.Junior]: 0.5,
                            [ExpertiseLevel.Middle]: 0.8,
                            [ExpertiseLevel.Senior]: 1.5,
                            [ExpertiseLevel.Expert]: 2.5,
                        })[U.en(ExpertiseLevel, e.level)]);
                });

                return U.sum(caps);
            });
    }


    /**
     * get workload
     *
     * return required numbers in man/hours for the month
     *
     * @returns {Promise<number>}
     */
    public abstract get workload():Promise<number>;

    /**
     * get complexity
     *
     * return complexity of the processes
     *
     * @returns {Promise<number>}
     */
    public abstract get complexity():Promise<number>;

    /**
     * @return {Promise<ActiveRecord>}
     */
    public updateDetails():Promise<Company> {
        this._company.departments = this._company.departments.map((d:any) => {
            if (this._departmentDetails.department._id == d.department)
                return this._departmentDetails.common;
            return d;
        });
        return <Promise<Company>>this._company.save();
    }

}

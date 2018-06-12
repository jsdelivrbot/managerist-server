import {BaseActionType} from "../base.actiontype";
import {Action} from "../action";
import {Employee} from "../../employee";
import {Role} from "../../role";
import {Game} from "../../game";
import {Company} from "../../company";
import {ExpertiseLevel, TechnologyExpertise} from "../../technology";
import {EmployeeFactory} from "../../employee/employee.factory";
import { U } from "../../../common";
import { Department } from "../../department";

export class SetHeadActionType extends BaseActionType {
    protected _employee:Employee;
    protected _department:Department;

    get actionDetails():any  {
        return {
            date: this._date || this.ga.time,
            company: this._company._id,
            description: this._employee.name + ' was set as head of  ' + this._department.name,
            details: {
                employee: this._employee._id,
                department: this._department._id,
            }
        }
    }

    /**
     *
     * @param data
     * @returns {any}
     */
    do(data:any): Promise<Action> {
        let _game:Game;
        if (!data.company)
            return Promise.reject('Can\'t perform "Set Head" Action: Company is not set.');
        this._company = data.company;
        if (!data.department)
            return Promise.reject('Can\'t perform "Set Head" Action: Department is not set.');
        this._department = data.department._id
            ? data.department
            : Department.getByName(data.department);
        if (!data.employee)
            return Promise.reject('Can\'t perform "Set Head" Action: Employee is not set.');
        this._employee = data.employee

        let pEmployee = (this._employee._id
                ? Promise.resolve(this._employee)
                : (new Employee(this.ga)).findById(this._employee)
            )
            .then((emp:Employee) => this._employee = emp),
            pCompany = (this._company._id
                ? Promise.resolve(this._company)
                : (new Company(this.ga)).findById(this._company)
            )
            .then((c:Company) => this._company = c);

        return pCompany
            .then(() => pEmployee)
            .then(() => {
                this._company.departments = this._company.departments.map((d:any) => {
                    if (d.department.toString() == this._department._id.toString()) {
                        d.head = this._employee._id;
                    }
                    return d;
                });
                return this._company.save();
            })
            .then(() => super.do.call(this));
    }
}
import {BaseActionType} from "../base.actiontype";
import {Action} from "../action";
import {Employee} from "../../employee";
import {Role} from "../../role";
import {Game} from "../../game";
import {Company} from "../../company";
import {ExpertiseLevel, TechnologyExpertise} from "../../technology";
import {EmployeeFactory} from "../../employee/employee.factory";

export class HrAgencyActionType extends BaseActionType {
    protected _employee:Employee;
    protected _role:Role;

    get actionDetails():any  {
        return {
            date: this._date || this.ga.time,
            company: this._company._id,
            description: 'HR Agency found a new employee for you: '
            + this._employee.name,
            details: {
                employee: this._employee._id,
                role: this._employee.role,
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
            return Promise.reject('Can\'t create "Assign" Event: Company is not set.');
        this._company = data.company;

        let role:Role,
            lvl:ExpertiseLevel = TechnologyExpertise.randomLevel();

        return (this._company._id
                    ? Promise.resolve(this._company)
                    : (new Company(this._ga)).findById(this._company._id || this._company)
                    .then((c:Company) => this._company = c)
            )
            .then(() => this._company.hrDepartment.randomRole())
            .then((r:Role) => {
                this._role = r;
                return new (EmployeeFactory(this.ga)).generate(this._role, lvl);
            })
            .then(() => {
                this._company.funds = this._company.funds - this._company.hrDepartment.agencyPrice;
                return this._company.save();
            })
            .then(() => super.do.call(this));
    }
}
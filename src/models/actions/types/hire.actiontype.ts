import {BaseActionType} from "../base.actiontype";
import {Employee} from "../../employee";
import {Event} from "../../event";
import {Game} from "../../game";
import {Company} from "../../company";
import {AssignmentActionType} from "./assignment.actiontype";
import {Action} from "../action";
import {Role} from "../../role";
import {Alert} from "../../alerts/alert";
import {AlertType} from "../../alerts/alert.type";

export class HireActionType extends BaseActionType {
    protected _period:number = 0;
    protected _probability:number = 0;

    protected _company:any;
    protected _employee:any;
    protected _hr:any;
    protected _salary:number;

    get actionDetails():any  {
        let data = {
            date: this._date,
            company: this._company._id,
            description: this._employee.name + ' Hired to the ' + this._company.name,
            details: {
                employee: this._employee._id,
                salary: this._employee.salary
            }
        };
        return data;
    }

    /**
     *
     * @param data
     * @returns {Promise<TResult>}
     */
    do(data:any): Promise<Action> {
        if (!data.employee)
            throw new Error('No Employee Hirement.');
        if (!data.company)
            throw new Error('No Company Hirement.');
        this._date = new Date(data.date || this._date);

        let pCompany = data.company._id
            ? Promise.resolve(data.company)
            : (new Company(this.ga)).findById(data.company);
        return pCompany
            .then((cmp:any) => this._company = cmp)
            .then(() => {
                if (data.employee && data.employee.role && data.employee.role._id)
                    return data.employee;
                return (new Employee(this.ga)).withRelations(['role']).findById(data.employee._id || data.employee, true)
            })
            .then((emp:any) => this._employee = emp)
            .then(() => {
                if (data.hr)
                    return (new Employee(this.ga)).withRelations(['role']).findById(data.hr, true)
                        .then((hremp:Employee) => this._hr = hremp);
                return null;
            })
            .then(() => {
                return this._employee.calcStartSalary(this._hr ? this._hr.calcHrBonus() : 0)
            })
            .then((_sal:number) => this._salary = _sal)
            .then((_sal:number) =>
                this._employee.populate({
                    company: this._company._id,
                    salary: this._salary,
                    // Reset visibility for other companies (there maybe some updates to keep other companies in some cases)
                    visible: []
                }).save()
            )
            .then(() => {
                return super.do.call(this)
            })
            .then((hirement:Action) => {
                return (new Game).findById(this.ga.gameId)
                    .then((g: Game) => {
                        if (g.options.autoAssign) {
                            return (new AssignmentActionType(this.ga)).do({
                                company: this._company,
                                employee: this._employee
                            })
                                .then(() => hirement);
                        } else
                            return hirement;
                    })
            });
    }
}
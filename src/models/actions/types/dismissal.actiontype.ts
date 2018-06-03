import {BaseActionType} from "../base.actiontype";
import {Employee} from "../../employee";
import {Event} from "../../event";
import {Action} from "../action";
import {Company} from "../../company";
import {Position} from "../../position";

export class DismissalActionType extends BaseActionType {
    protected _period:number = 0;
    protected _probability:number = 0;

    protected _employee:any;
    get actionDetails():any  {
        return {
            date: this._date,
            company: this.company._id || this.company,
            description: this._employee.name + ' dismissal',
            details: {
                employee: this._employee._id
            }
        }
    }

    /**
     *
     * @param data
     * @returns {Promise<TResult>}
     */
    do(data:any): Promise<Action> {
        if (!data.employee)
            return Promise.reject('Can\'t create "Dismisal" Event: Employee is not set.');
        this._employee = data.employee;
        if (!data.company)
            return Promise.reject('Can\'t create "Dismisal" Event: Company is not set.');
        this._company = data.company;

        return (this._company._id
                    ? Promise.resolve(this._company)
                    : (new Company(this._ga)).findById(this._company._id || this._company)
                    .then((c:Company) => this._company = c)
            )
            .then(() =>(this._employee._id && this._employee.role._id
                    ? Promise.resolve(this._employee)
                    : (new Employee(this._ga)).withRelations(['role']).findById(this._employee._id || this._employee)
                    .then((e:Employee) => this._employee = e)
            ))
            .then((emp:any) => this._employee = emp)
            .then((emp:any) => emp.populate({company: null, product: null, project: null}).save())
            .then(() => new Position(this.ga).findAll({
                employee:this._employee._id,
                company:this._company._id
            }))
            .then((pos:Position[]) => Promise.all(
                pos.map((p:Position) => p.populate({endDate: this._date}))
            ))
            .then(() => super.do.call(this))
    }
}
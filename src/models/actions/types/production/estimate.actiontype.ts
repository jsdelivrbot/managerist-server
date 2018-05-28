import {BaseActionType} from "../../base.actiontype";
import {Employee} from "../../../employee";
import {Event} from "../../../event";
import {Game} from "../../../game";
import {Company} from "../../../company";
import {Action} from "../../action";
import {Role} from "../../../role";
import {Alert} from "../../../alerts/alert";
import {AlertType} from "../../../alerts/alert.type";
import {Project} from "../../../project";

export class EstimateActionType extends BaseActionType {
    protected _period:number = 0;
    protected _probability:number = 0;

    protected _company:Company|any;
    protected _employee:Employee;
    protected _project:Project;

    get actionDetails():any  {
        let data = {
            date: this._date,
            company: this._company._id || this._company,
            description: this._employee.name + ' Hired to the ' + this._company.name,
            details: {
                employee: this._employee._id,
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
        if (!data.project)
            throw new Error('No Project for estimation.');
        if (!data.employee)
            throw new Error('No Developer for estimation.');
        this._date = new Date(data.date || this._date);

        return (new Promise((resolve) => {
                if (data.employee && data.employee.role && data.employee.role._id)
                    return resolve(data.employee);
                return resolve(
                    (new Employee(this.ga)).withRelations(['role']).findById(data.employee._id || data.employee, true)
                );
            }))
            .then((emp:any) => this._employee = emp)
            .then(() => {
                if (data.project && data.project.company)
                    return data.project;
                return (new Project(this.ga)).withRelations(['company']).findById(data.project._id || data.project)
            })
            .then((prj:Project) => {
                this._project = prj;
                this._company = this._project.company;

                return this._project.estimate(this._employee);
            })
            .then(() => {
                return super.do.call(this)
            })
    }
}
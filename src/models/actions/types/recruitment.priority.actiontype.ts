import {BaseActionType} from "../base.actiontype";
import {Action} from "../action";
import {Employee} from "../../employee";
import {Role} from "../../role";
import {Game} from "../../game";
import {Project} from "../../project";
import {Product} from "../../product";
import {ActiveRecord} from "../../../core/db/active.record";
import {Company} from "../../company";
import {Department} from "../../department";

/***
 *
 */
export class RecruitmentPriorityActionType extends BaseActionType {
    protected _roles:Role[];

    get actionDetails():any  {
        return {
            date: this._date || this.ga.time,
            company: this._company._id,
            description: 'Hirement priority was set to: '
                + this._roles.map((r:Role) => r.name).join(),
            details: {
                roles: this._roles.map((r:Role) => r._id),
            }
        }
    }

    /**
     *
     * @param data
     * @returns {any}
     */
    do(data:any): Promise<Action> {
        if (!data.company)
            return Promise.reject('Can\'t perform "RecruitmentPriority" Action: Company is not set.');
        this._date = new Date(data.date || this._date);
        this._company = data.company;

        this._roles = data.roles || [];

        return (this._company._id
                ? Promise.resolve(this._company)
                : (new Company(this._ga)).findById(this._company._id || this._company)
                .then((c:Company) => this._company = c)
        )
        .then(() => {
            let hr = Department.getByName('HR');
            this._company.departments = this._company.departments.map((d:any) => {
                if (d.department.toString() == hr._id.toString()) {
                    d.priority = this._roles;
                }
                return d;
            });
            return this._company.save();
        })
        .then(() => super.do.call(this,{}));
    }
}
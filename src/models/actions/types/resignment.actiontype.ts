import {BaseActionType} from "../base.actiontype";
import {Position} from "../../position";
import {Employee} from "../../employee";
import {Project} from "../../project";
import {Product} from "../../product";
import {Action} from "../action";

export class ResignmentActionType extends BaseActionType {
    protected _period:number = 0;
    protected _probability:number = 0;

    protected _employee:Employee;
    protected _position:Position;
    protected _project:Project;
    protected _product:Product;

    get actionDetails():any  {
        return {
            date: this._date,
            company: this._company._id,
            description: this._employee.name + ' resigned and put into the pool\n'
                + (this._product ? ('From Product: ' + this._product.name + '\n') : '')
                + (this._project ? ('From Project: ' + this._project.name + '\n') : ''),
            details: {
                employee: this._employee._id,
                position: this._position,
                project: this._project ? this._project._id : null,
                product: this._product ? this._product._id : null
            }
        }
    }

    /**
     *
     * @param data
     * @returns {any}
     */
    do(data:any): Promise<Action> {
        if (!data.position)
            return Promise.reject('Position is empty in data for "Resignment"');
        return (new Position(this.ga)).withRelations(['employee', 'company', 'product', 'project'])
            .findById(data.position._id || data.position) // to populate data into ActiveRecord
            .then((pos:any) => {
                this._employee = pos.employee;
                this._position = pos;
                this._project = pos.project;
                this._product = pos.product;

                return pos.populate({
                        endDate: this._date
                    })
                    .save()
            })
            .then(() => super.do.call(this));
    }
}
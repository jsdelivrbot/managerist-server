import {BaseActionType} from "../base.actiontype";
import {Action} from "../action";
import {Employee} from "../../employee";
import {Game} from "../../game";
import {Project} from "../../project";
import {Product} from "../../product";
import {ActiveRecord} from "../../../core/db/active.record";
import {Company} from "../../company";
import {Department} from "../../department";

export class AssignmentActionType extends BaseActionType {
    protected _employee:Employee;
    protected _project:Project;
    protected _product:Product;

    get actionDetails():any  {
        if (!this._employee) return {};
        return {
            date: this._date || this.ga.time,
            company: this._company._id,
            description: this._employee.name + ' assigned to '
                + ((this._product && this._product.name) || '~') + '/'
                + ((this._project && this._project.name) || '~')
                + "\n Role: " + this._employee.role.name
                + "\n Efficiency: " + this._employee.efficiency,
            details: {
                employee: this._employee._id,
                project: this._project && this._project._id || null,
                product: this._product && this._product._id || null,
                efficiency: this._employee.efficiency,
                role: this._employee.role && (this._employee.role._id || this._employee.role)
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
        if (!data.employee)
            return Promise.reject('Can\'t create "Assign" Event: Employee is not set.');
        this._employee = data.employee;
        if (!data.company)
            return Promise.reject('Can\'t create "Assign" Event: Company is not set.');
        this._company = data.company;
        this._date = new Date(data.date || this._date);
        return (this._company._id
                ? Promise.resolve(this._company)
                : (new Company(this._ga)).findById(this._company._id || this._company)
                .then((c:Company) => this._company = c)
            )
            .then(() => {
                if (this._employee._id && this._employee.role._id)
                    return this._employee;
                return (new Employee(this._ga)).withRelations(['role'])
                    .findById(this._employee._id || this._employee)
                    .then((e:Employee) => this._employee = e);
            })
            .then(() => {
                console.log('A: Employee foud. \n');
                return (new Game).findById(this.ga.gameId);
            })
            .then((g:Game) => {
                _game = g;
                if (!g.options.autoAssign && !data.project && !data.product)
                    return Promise.reject('Can\'t create "Assign" Event: Both Product & Project are not set.');

                if (!data.product)
                    return (new Product(this.ga))
                        .find(data.project
                            ? {_id: data.project._id || data.project}
                            : {}
                        )
                        .then((p:Product|ActiveRecord|null) => {
                            if (p) data.product = p;
                            this._product = data.product;
                        });

                return this._product = data.product;
            })
            .then(() => {
                if (_game.options.autoAssign && !data.project && this._product) {
                    return (new Project(this.ga)).find({product: this._product._id || this._product})
                        .then((p: Project) => this._project = p);
                }
                return this._project = data.project;
            })
            .then(() => {
                let dep = <Department>Department.getById(this._employee.role.department._id || this._employee.role.department);
                return this._employee.assign(
                    this._date.getTime(),
                    dep,
                    this._project,
                    this._product,
                )
            })
            .then(() => super.do.call(this));
    }
}
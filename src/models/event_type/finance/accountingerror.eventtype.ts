import {BaseEventType, EmployeeEventType} from "../base.eventtype";
import {Event} from "../../event";
import {Company} from "../../company";
import {Employee} from "../../employee";
import {FinanceStats} from "../../company/departments/finance/stats";
import {ActiveRecord} from "../../../core/db/active.record";
import {EventType} from "../../event.type";

/**
 * Class AccountingErrorEventType
 *
 * Probable mistake in accounting, results with penalty
 * (the main reason to have Accountant)
 */
export class AccountingErrorEventType extends BaseEventType implements EmployeeEventType {
    protected _period:number = 2628000; // 1 month
    protected _probability:number = 0.6; // 60% (default)

    protected _minPenalty:number = 100;
    protected _maxPenalty:number = 1000;

    protected _company:Company|any;
    protected _employee:Employee|any;
    protected _finStats:FinanceStats;
    protected _amount:number = 100;

    private get finStats():Promise<FinanceStats> {
        return this._finStats
            ? Promise.resolve(this._finStats)
            : this.companyAr
                .then((c:Company|any) => {
                    this._finStats = new FinanceStats(c);
                    return this._finStats;
                });
    }

    get companyAr():any {
        if (!this._company) {
            return (new Company(this.ga)).find({user:this.ga.userId})
                .then((c:Company) => this._company = c);
        }

        if (!this._company._id)
            return (new Company(this.ga))
                .findById(this._company)
                .then((cmp) => this._company = cmp);

        return Promise.resolve(this._company);
    }

    private get employee(): Promise<Employee|any|null> {
        return this._employee && this._employee._id
            ? new Promise<Employee|any>(() => this._employee)
            : this.finStats
                .then(() => this._finStats.employees)
                .then((es: Employee[]|any[]) => {
                    if (!es.length)
                        return null;
                    return es[Math.floor(Math.random() * es.length)];
                })
                .then((e:Employee|any) => {
                    this._employee = e;
                    return this._employee;
                });
    }

    /**
     * getter probability
     *
     * Error probability depends on Company Finance Department complexity (workload), and capability of it's employees
     *
     * @returns {Promise<number>}
     */
    get probability():Promise<number> {
        console.log('ACCOUNTING ERROR PROBABILITY ?...');
        return this.finStats
            .then(() => {
                console.log('AE FinStats received...');
                return this._finStats.efficiency
            })
            .then((e) => {
                console.log('AE Fin EFFICIENCY = ' + e);
                return this._probability * (1-e)
            });
    };

    get eventData():any  {
        return {
            type: EventType.getByName('AccountingError')._id,
            description: 'Someone fucks up with your declarations'
            + (this._employee
                ?     "\n Role: " + this._employee.role.name
                    + "\n Efficiency: " + this._employee.efficiency
                : ''
            ),
            details: {
                employee: this._employee ? this._employee._id : null,
                amount: this._amount
            }
        }
    }

    /**
     *
     * @param data
     * @returns {any}
     */
    public createEvent(data:any): Promise<Event|ActiveRecord> {
        if (!data.company)
            throw new Error('Company is mandatory for ' + this.constructor.name);
        this._company = data.company;
        this._amount = Math.random() * (this._maxPenalty - this._minPenalty);
        return this.employee
            .then(() =>
                this._company._id || (new Company(this.ga)).findById(this._company)
            )
            .then((c:Company) => {
                this._company = c;
                return this._company.populate({
                    funds: this._company.funds - this._amount
                })
                .save()
            })
            .then(() =>
                (new Event(this.ga))
                .populate(data)
                .populate(this.eventData)
                .save()
            );
    }
}

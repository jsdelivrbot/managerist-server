import {BaseEventType} from "./base.eventtype";
import {Event} from "../event";
import {Company} from "../company";
import {ActiveRecord} from "../../core/db/active.record";
import {HrStats} from "../company/departments/hr/stats";
import {Employee} from "../employee";
import {Role} from "../role";
import {ExpertiseLevel} from "../../common/models/technology";
import {U} from "../../common/u";
import {TechnologyExpertise} from "../technology/technology.expertise";
import {EventType} from "../event.type";
import {EmployeeFactory} from "../employee/employee.factory";

/**
 * Class NewEmployeeEventType
 */
export class NewEmployeeEventType extends BaseEventType {
    protected _period: number = 864000; // 10 days
    protected _probability: number = 0.1; // 10%

    protected _hrStats:HrStats;
    protected _employee:Employee;
    protected _role:Role;
    protected _company:Company;

    /**
     * getter probability
     *
     * Error probability depends on Company Finance Department complexity (workload), and capability of it's employees
     *
     * @returns {Promise<number>}
     */
    get probability(): Promise<number> {
        return this.hrStats
            .then(() => this._hrStats.recruitmentEfficiency)
            .then((e) => {
                let res:number = Math.max(this._probability, e);
                return res;
            });
    };

    /**
     * @returns {Promise<HrStats>}
     */
    private get hrStats(): Promise<HrStats> {
        if (this._hrStats)
            return Promise.resolve(this._hrStats);
        return this.companyAr
                .then((c: Company | any) => {
                    this._hrStats = new HrStats(c);
                    return this._hrStats;
                });
    }

    get companyAr():any {
        if (!this._company) {
            return (new Company(this.ga)).find({user:this.ga.userId})
                .then((c:Company) => {
                    this._company = c;
                    return this._company;
                });
        }

        if (!this._company._id)
            return (new Company(this.ga))
                .findById(this._company)
                .then((c:Company) => {
                    this._company = c;
                    return this._company;
                });

        return Promise.resolve(this._company);
    }

    get eventData(): any {
        return {
            type: EventType.getByName('NewEmployee')._id,
            description: 'New specialist available\n Role: ' + this._role.name,
            details: {
                employee: this._employee._id || this._employee,
                role: this._role._id || this._role,
            }
        }
    }

    /**
     *
     * @param data
     * @returns {any}
     */
    public createEvent(data: any): Promise<Event | ActiveRecord> {
        if (!data.company)
            throw new Error('Can\'t be determined without Company.');
        this._company = data.company;

        let role:Role,
            lvl:ExpertiseLevel = TechnologyExpertise.randomLevel();
        return this.companyAr
            .then(() => this.hrStats)
            .then(() => this._getRole())
            .then((r:Role) => role = r)
            .then(() => (new EmployeeFactory(this.ga)).generate(role, lvl, [this._company._id || this._company]))
            .then((emp:Employee) => this._employee = emp)
            .then(() => {
                let ed = this.eventData,
                    d = data;
                delete(d.game);

                return (new Event(this.ga))
                        .populate(data)
                        .populate(ed)
                        .save()
            });
    }

    /**
     *
     * @return {Promise<Role>}
     * @private
     */
    protected _getRole():Promise<Role> {
        let priority = this._company.hrDepartment.priority;
        return (new Role).findAll(
            priority.length
                ? {_id: priority}
                : {}
        ).then((roles:Role[]) => {
            let role = roles[Math.floor(Math.random() * roles.length)];
            this._role = role;
            return role;
        })
    }
}

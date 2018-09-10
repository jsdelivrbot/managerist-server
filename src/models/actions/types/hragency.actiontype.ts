import {BaseActionType} from "../base.actiontype";
import {Action} from "../action";
import {Employee} from "../../employee";
import {Role} from "../../role";
import {Game} from "../../game";
import {Company} from "../../company";
import {ExpertiseLevel, TechnologyExpertise} from "../../technology";
import {EmployeeFactory} from "../../employee/employee.factory";
import { U } from "../../../common";

export enum HrAgencyPackage {Basic, Normal, Vip};

export class HrAgencyActionType extends BaseActionType {
    protected _employee:Employee;
    protected _role:Role;
    protected _pkg:HrAgencyPackage;
    protected _price:number;

    private static _basicPrice = 500;
    static get basicPrice() { return HrAgencyActionType._basicPrice;}

    static getPrice(pkg:HrAgencyPackage) {
        let mul = 1;
        switch(pkg) {
            case HrAgencyPackage.Vip:
                mul = 3;
                break;
            case HrAgencyPackage.Basic:
                mul = 0.5;
                break;
        }
        return mul * HrAgencyActionType._basicPrice;
    }

    get actionDetails():any  {
        return {
            date: this._date || this.ga.time,
            company: this._company._id,
            description: 'HR Agency found a new employee for you: '
            + this._employee.name
            + ' it was cost to you '+this._price+'$ with package' + U.e(HrAgencyPackage, this._pkg),
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
        if (data.package == undefined)
            return Promise.reject('Service package should be provided.');
        this._pkg = U.en(HrAgencyPackage, data.package);

        this._price = HrAgencyActionType.getPrice(this._pkg);

        let minLvl:ExpertiseLevel = this._minLevel4Pkg(),
            lvl:ExpertiseLevel = TechnologyExpertise.randomLevel(minLvl, this._maxLevel4Pkg());

        return (this._company._id
                    ? Promise.resolve(this._company)
                    : (new Company(this._ga)).findById(this._company._id || this._company)
                    .then((c:Company) => this._company = c)
            )
            .then(() => this._company.hrDepartment.randomRole())
            .then(async (r:Role) => {
                this._role = r;
                let factory = new EmployeeFactory(this.ga),
                    attempts = 3,
                    attempt = async () => await factory.generate(this._role, lvl, [this._company._id]),
                    emp: any;

                while(attempts) {
                    try {
                        emp = await attempt;
                        break;
                    } catch(err) {
                        attempts--;
                        minLvl++;
                        lvl =  TechnologyExpertise.randomLevel(minLvl, this._maxLevel4Pkg());
                    }
                }
                if (!emp) throw new Error("Failed to find employee with desired params.");
                return emp;
            })
            .then((emp:Employee) => {
                this._employee = emp;
                this._company.funds = this._company.funds - this._price
                return this._company.save();
            })
            .then(() => super.do.call(this));
    }

    _minLevel4Pkg():ExpertiseLevel {
        if (this._pkg == HrAgencyPackage.Vip)
            return ExpertiseLevel.Senior;
        if (this._pkg == HrAgencyPackage.Normal)
            return ExpertiseLevel.Junior;
        return ExpertiseLevel.Intern;
    }

    _maxLevel4Pkg():ExpertiseLevel {
        if (this._pkg == HrAgencyPackage.Vip)
            return ExpertiseLevel.Expert;
        if (this._pkg == HrAgencyPackage.Normal)
            return ExpertiseLevel.Senior;
        return ExpertiseLevel.Middle;
    }    
}
import {Company as CompanyCommon, CompanySize} from '../../common/models/company';
export {Company as CompanyCommon, CompanySize} from '../../common/models/company';
import {SchemaTypes, ActiveRecord, ActiveRecordRule, ActiveRecordRulesTypes} from "../../core/db/active.record";
import {User, UserType} from "../user";
import {U} from "../../common/u";
import {GameBased} from "../game.based";
import {CompanyDepartment} from "./departments/company.department";
import {Department} from "../department";
import {HrCompanyDepartment} from "./departments/hr/department";
import {FinanceCompanyDepartment} from "./departments/finance/department";
import {MarketingCompanyDepartment} from "./departments/marketing/department";
import {ProductionCompanyDepartment} from "./departments/production/department";

export interface CompanyFinancials {
    _id: any;
    net: number,
    funds: number,
    monthly: number;
    salaries: number;
}

/**
 * Class Company
 */
export class Company extends GameBased {
    // common
    funds: number;
    net: number;
    name: string;
    departments: CompanyDepartment[];

    protected _common = CompanyCommon;
    protected _customWith:string[] = [];
    protected _schema:any = {
        size: String,
        user: SchemaTypes.ObjectId,
        departments: SchemaTypes.Mixed
    };

    /**
     * @returns {{size: {type: ActiveRecordRulesTypes, related: CompanySize}}}
     */
    get rules():{[key:string]:ActiveRecordRule} {
        return {
            size: {type:ActiveRecordRulesTypes.ENUM, related: CompanySize}
        };
    }

    get hrDepartment():HrCompanyDepartment {
        if (!this.departments) this.departments = [];
        let hr = Department.getByName('HR'),
            hrd = this.departments.find((d:any) => d.department.toString() == hr._id.toString());
        if (!(hrd instanceof HrCompanyDepartment))
            hrd = new HrCompanyDepartment(hrd);
        return <HrCompanyDepartment>hrd;
    }

    get financeDepartment():FinanceCompanyDepartment {
        if (!this.departments) this.departments = [];
        let dep = Department.getByName('Finance'),
            depD = this.departments.find((d:any) => ''+d.department == '' + dep._id);
        if (!(depD instanceof FinanceCompanyDepartment))
            depD = new FinanceCompanyDepartment(depD);
        return <FinanceCompanyDepartment>depD;
    }

    get marketingDepartment():MarketingCompanyDepartment {
        if (!this.departments) this.departments = [];
        let dep = Department.getByName('Marketing'),
            depD = this.departments.find((d:any) => ''+d.department == '' + dep._id);
        if (!(depD instanceof MarketingCompanyDepartment))
            depD = new MarketingCompanyDepartment(depD);
        return <MarketingCompanyDepartment>depD;
    }

    get productionDepartment():ProductionCompanyDepartment {
        if (!this.departments) this.departments = [];
        let dep = Department.getByName('Production'),
            depD = this.departments.find((d:any) => ''+d.department == '' + dep._id);
        if (!(depD instanceof ProductionCompanyDepartment))
            depD = new ProductionCompanyDepartment(depD);
        return <ProductionCompanyDepartment>depD;
    }

    /**
     *
     * @returns {any|boolean}
     */
    get userId():any {
        let u = (<any>this).user;
        return u && u.constructor.name == 'User' ? (u._id || false) : u;
    }

    withRelations(obj:string[]) {
        if (obj.indexOf('user') != -1)
            this._customWith.push('user');
        this._with = (obj || [])
            .filter(o => o != 'user') // User is external DB entity (main DB), so should be processed explicitly
            .join(' ');

        return this;
    }

    public getFieldValue(prop:string, curr:any) {
        if (prop == 'departments' && !curr) {
            return [
                this.hrDepartment,
                this.financeDepartment,
                this.marketingDepartment,
                this.productionDepartment
            ].map((cd: CompanyDepartment) => cd.common);
        }
        return super.getFieldValue(prop, curr);
    }

    /**
     *
     * @param data
     * @returns {any}
     * @private
     */
    protected _create(data: any = {}): Promise<ActiveRecord> {
        if ((!data.departments || !data.departments.length) && (!this.departments || !this.departments.length)) {
            data.departments = [
                this.hrDepartment,
                this.financeDepartment,
                this.marketingDepartment,
                this.productionDepartment
            ].map((cd: CompanyDepartment) => cd.common);
        }

        return super._create.call(this, data)
    }

    /**
     *
     * @param cond
     * @param populate
     * @returns {Promise<TResult>}
     */
    find(cond:any, populate: boolean = true): Promise<ActiveRecord|null> {
        return super.find(cond, populate)
            .then((ar:any) => {
                if (this._customWith.indexOf('user') != -1) {
                    return (new User).findById(ar.user)
                        .then((u:any) => {
                            ar.user = u;
                            return ar;
                        });
                }
                return ar;
            })
    }

    /**
     * findAll
     *
     * overloaded to populate @see(User) whitch is resided in another DB
     *
     * @param cond
     * @returns {any}
     */
    findAll(cond?:any): Promise<ActiveRecord[]> {
        return super.findAll(cond)
            .then((ars:any[]) => {
                if (this._customWith.indexOf('user') != -1) {
                    return (new User).findAll({
                        _id: ars.map(ar => ar.user)
                    })
                        .then((us:any[]) => {
                            return ars.map(ar => {
                                ar.user = us.find((u:any)=> ('' + u._id) == ('' + ar.user)) || null;
                                return ar;
                            });
                        });
                }
                return ars;
            })
    }

    /**
     * Calculate basic Fin-Stats of the company (or all companies)
     *  - salaries
     *  - cumulated products income
     *
     * @param id
     */
    getFinancials = (id?:any) : Promise<CompanyFinancials|CompanyFinancials[]> => new Promise<any>((resolve, reject) => {
        id = id || this._id;

        let aggregation: any[] = [
            { $project : { net : 1 , funds : 1 } },
            {$lookup: {from: "employees", localField: "_id", foreignField: "company", as: "emp"}},
            {$lookup: {from: "products", localField: "_id", foreignField: "company", as: "prod"}},
            {$unwind: {path:"$emp", preserveNullAndEmptyArrays: true}},
            {$group: {
                _id: "$_id",
                net:{$first: "$net"},
                funds:{$first: "$funds"},
                prod: {"$first": "$prod"},
                salaries: {$sum: "$emp.salary"}
            }},
            {$unwind: {path:"$prod", preserveNullAndEmptyArrays: true}},
            {$group: {
                _id: "$_id",
                net:{$first: "$net"},
                funds:{$first: "$funds"},
                monthly: {$sum: "$prod.monthly"},
                salaries: {"$first": "$salaries"}
            }}
        ];
        if (id)
            aggregation.unshift({$match: this._prepareCond({_id: id})});

        return this.model.aggregate(aggregation)
            .exec((err: Error, data: any) => {
                if (!err)
                    resolve((id ? data[0] : data) || {});
                else
                    reject('Faied to fetch Company (id:' + id + ') Financials.');
            });
    });

    /**
     * Return the list of companies that belongs to current User
     *
     * @returns {any}
     */
    getCurrent(): Promise<Company[]|ActiveRecord[]> {
        return this.findAll({user:this._ga.userId});
    }

    protected _beforeSave():Promise<boolean> {
        if (this.userId)
        return Promise.resolve(true);

        return (new User()).populate({name: U.randomName(), type: UserType.AI0}).save()
                .then((u:any) => {
                    console.log('\n\n\nNew User GENEGATED FOR COMPANY '+ (<any>this).name +' \n\n\n', !!(u && u._id));
                    (<any>this).user = u._id;
                    return !!(u && u._id)
                });
    }
}

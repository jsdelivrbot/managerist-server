import {BaseEventType, CustomerEventType} from "./base.eventtype";
import {Company} from "../company";
import {Project, ProjectType} from "../project";
import {Employee} from "../employee";
import {ExpertiseLevel} from "../technology"
import {Event} from "../event";
import {Product} from "../product";
import {U} from "../../common/u";

/**
 * Class NewProjectEventType
 * @deprecated
 */
export class NewProjectEventType extends BaseEventType {
    private static MAX_FREELANCE_REWARD = 10000;
    private static MIN_FREELANCE_REWARD = 100;

    private static MAX_FREELANCE_HOUR_COST = 150;
    private static MIN_FREELANCE_HOUR_COST = 10;

    protected _period:number = 2628000000; // 1month
    protected _probability:number = 0.1; // 10%
    protected _company;

    get probability():Promise<number> {
        return this.companyAr
            .then(() => this.upgradeProbability)
            .then(() => this.startupProbability)
            .then(() => this.freelanceProbability)
            .then(() => Math.min(1, this._upgradeProb + this._startupProb + this._freelanceProb));
    }

    get companyAr():any {
        if (!this._company)
            throw new Error('Can\'t be determined without Company.');

        if (this._company.constructor.name != 'Company')
            return (new Company(this.ga))
                .findById(this._company)
                .then((cmp) => this._company = cmp);

        return Promise.resolve(this._company);
    }

    protected _employeesCount: number;
    get employeesCount():Promise<number> {
        return this._employeesCount
            ? Promise.resolve(this._employeesCount)
            : this.companyAr
                .then(() =>(new Employee(this.ga)).count({company:this._company._id}))
                .then((n:number) => this._employeesCount = n);

    }

    protected _freelanceProb:number;
    protected _freelanceReward:number = 0;

    /**
     *  Based that if you Product company with monthly income more than max reward you not interested in freelance
     *  so 0 - prob
     *
     *  Then the more income you have as a Product Company, the more clients you may have
     *
     * @returns Promise<number>
     */
    get freelanceProbability(): Promise<number> {
        return typeof this._freelanceProb != 'undefined'
            ? Promise.resolve(this._freelanceProb)
            : this.companyAr
                .then(() => this._company.getFinancials())
                .then((fin:any) => {
                    this._freelanceReward = this._freelanceProb = 0;

                    let mnth = fin.monthly || 0;

                    if (mnth > NewProjectEventType.MAX_FREELANCE_REWARD)
                        return 0;

                    let v = Math.random() *
                        (Math.max(mnth, NewProjectEventType.MAX_FREELANCE_REWARD) - NewProjectEventType.MIN_FREELANCE_REWARD);
                    this._freelanceReward = Math.min(v, NewProjectEventType.MAX_FREELANCE_REWARD);
                    this._freelanceProb = mnth/NewProjectEventType.MAX_FREELANCE_REWARD;
                    return this._freelanceProb;
                });
    }

    protected _startupProb:number;
    /**
     * Based on: The more "loafers" (dreamers) you have the more chances that they came up with new startup
     *
     * @returns Promise<number>
     */
    get startupProbability(): Promise<number> {
        return typeof this._startupProb != 'undefined'
            ? Promise.resolve(this._startupProb)
            : this.employeesCount
                .then(() =>
                    (new Employee(this.ga)).count({
                        company: this._company._id,
                        product: {$eq: null},
                        project: {$eq: null},
                    })
                ).then((n:number) => {
                    this._startupProb = this._employeesCount ? n/this._employeesCount : 0;
                    return this._startupProb;
                });
    }

    protected _upgradeProb:number;
    protected _upgradableProducts:Product[]|any[] = [];
    /**
     * Based on: The more employees used on products, there more chance that it will have chance to upgrade
     *
     * @returns Promise<number>
     */
    get upgradeProbability(): Promise<number> {
        return typeof this._upgradeProb != 'undefined'
            ? new Promise<number>(() => this._upgradeProb)
            : this.employeesCount
                .then(() =>
                    (new Employee(this.ga)).count({
                        company: this._company._id,
                        product: {$ne: null}
                    })
                )
                .then((n:number) => {
                    this._upgradeProb = this._employeesCount ? n/this._employeesCount : 0;
                    return this._upgradeProb;
                })
                .then((p) => {
                    return p
                        ? (new Product(this.ga)).findAll({company: this._company._id})
                            .then((prods: any[]) => this._upgradableProducts = prods)
                            .then(() => p)
                        : 0
                });
    }

    protected _project:Company|any;
    get eventData():any  {
        let moneyGain = Math.random() * NewProjectEventType.MAX_FREELANCE_REWARD,
            hours = moneyGain / (
                NewProjectEventType.MIN_FREELANCE_HOUR_COST
                + Math.random()*(NewProjectEventType.MAX_FREELANCE_HOUR_COST - NewProjectEventType.MIN_FREELANCE_HOUR_COST)
            ),
            typeFreelance = this._freelanceProb - Math.random(),
            typeStartup = this._startupProb - Math.random(),
            typeUpgrade = this._upgradeProb - Math.random(),
            type = typeFreelance > typeStartup
                ? (typeFreelance > typeUpgrade ? ProjectType[ProjectType.Outsource] : ProjectType[ProjectType.Upgrade])
                : (typeStartup   > typeUpgrade ? ProjectType[ProjectType.Startup] : ProjectType[ProjectType.Upgrade]),
            reward = {},
            skillValues = Object.keys(ExpertiseLevel).map(k => Number.parseInt(k)).filter(s => !Number.isNaN(s)),
            skills = Array.apply(null, Array(Math.round(Math.random()*5)))
                .map((a:any) => Math.floor(Math.random() * skillValues.length))
                .filter((v:any,i:any,a:any) => a.indexOf(v) === i),
            product = null;

        switch (type) {
            case ProjectType[ProjectType.Outsource]:
                reward = {
                    company:{
                        funds: moneyGain
                    }
                };
                break;
            case ProjectType[ProjectType.Startup]:
                reward = {
                    product:{
                        monthly: moneyGain * Math.random()
                    }
                };
                break;
            case ProjectType[ProjectType.Upgrade]:
                let inx:number = Math.floor(Math.random() * (this._upgradableProducts||[]).length);
                product = this._upgradableProducts[inx]._id;
                reward = {
                    product:{
                        monthly: moneyGain * Math.random() * Math.random()
                    }
                };
                break;
        }

        return {
            description: 'ERROR: If you see this event than Project was not generated for ' + this._company.name,
            details: {
                preliminary: true,
                type,
                reward,
                hours,
                skills,
                product
            }
        }
    }

    /**
     *
     * @param e
     * @returns {any}
     */
    process(e:Event|any) : Promise<Event[]> {
        let events:Event[] = [];
        if (!e.details || !e.details.preliminary)
            return Promise.reject('Wrong event (event details should contain "preliminary" data)');

        return (new Company(this.ga)).findById(e.common.company) // to populate data into ActiveRecord
            .then((cmp) => {
                this._company = cmp;
                return this.companyAr
                    .then(() =>
                        (new Project(this.ga)).populate({
                            company: cmp._id,
                            product: e.details.product,
                            type: e.details.type,
                            hours: e.details.hours,
                            hoursCompleted: 0,
                            name: U.randomName(),
                            skills: e.details.skills,
                            reward: e.details.reward
                        })
                            .save()
                    );
            })
            .then((prj:Project|any) => {
                e.populate({
                    description: this._company.name + ' started a new project: ' + prj.name,
                    details: {
                        project: prj._id
                    },
                    processed: 1
                })
            })
            .then(() => events)
    }
}
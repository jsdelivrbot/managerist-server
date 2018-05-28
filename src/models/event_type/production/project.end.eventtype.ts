import {Event} from "../../event";
import {BaseEventType} from "../base.eventtype";
import {Project, ProjectType, ProjectStatus} from "../../project";
import {Product} from "../../product";
import {Company} from "../../company";
import {Employee} from "../../employee";
import {Audience} from "../../audience";
import {ActiveRecord} from "../../../core/db/active.record";
import {Technology} from "../../../../common/models/technology";

export class ProjectEndEventType extends BaseEventType {
    protected _period: number = 0;
    protected _probability: number = 0;

    protected _company: Company|any;
    protected _project: Project|any;
    protected _product: Product|any;

    get eventData(): any {
        return {
            description: this._project.name + ' has ended.',
            details: {
                project: this._project._id,
                product: this._product && this._product._id,
            }
        }
    }

    /**
     *
     * @param data
     * @returns {any}
     */
    public createEvent(data: any): Promise<Event|ActiveRecord> {
        if (!data.project)
            return Promise.reject('Project should be set.');

        let promiseProj:Promise<Project> = this._project._id
                ? (new Promise<Project>(() => this._project))
                : <Promise<Project>>((new Project(this.ga)).findById(this._project));

        return promiseProj
            .then((p: Project|any) => {
                this._project = p;
                this._product = p.product;
            })
            .then(() => new Event(this.ga)
                .populate(data)
                .populate(this.eventData)
            );
    }

    /**
     *
     * @param {Event | any} e
     * @returns {Promise<Event[]>}
     */
    process(e: Event|any): Promise<Event[]> {
        let events = [];
        return (new Project(this.ga)).withRelations(['product', 'company', 'audience']).findById(e.details.project)
            .then((p: Project) => {
                let rewards: Promise<any>[];
                if (p.reward.company)
                    rewards.push(
                        (new Company(this.ga)).findById(p.company._id || p.company)
                            .then((c:Company) => {
                                console.log("\n\nPROJECT ENDED ~ COMPANY-REWARD +="+(p.reward.company.funds || 0)+" (current "+c.funds+")\n\n");
                                return c.populate({
                                    funds: c.funds + (p.reward.company.funds || 0),
                                    net: c.net + (p.reward.company.net || 0),
                                }).save()
                            })
                    );
                if (p.reward.product)
                    rewards.push(
                        (new Product(this.ga)).findById(p.product._id || p.product)
                            .then((pr:Product) =>
                                pr.populate({
                                    monthly: pr.monthly + (p.reward.product.monthly || 0), // ???
                                    net: pr.net + (p.reward.product.net || 0),
                                    bugRate: pr.bugRate + (p.reward.product.bugRate || 0),
                                    tdRate: pr.tdRate + (p.reward.product.tdRate || 0),
                                }).save()
                            )
                            .then((pr:Product) => {

                                // upgrade Features on Product
                                // TODO ~ FeatureImplementation method
                                if (p.reward.features) {
                                    for (let fi of pr.features) {
                                        let updatedF = p.reward.features
                                            .find((_uf:any) => _uf._id == (fi.feature._id || fi.feature));

                                        if (updatedF)
                                            for(let fiProp of Object.getOwnPropertyNames(updatedF))
                                                (<any>fi)[fiProp] = (<any>updatedF)[fiProp];
                                    }
                                    return pr.save();
                                }
                                return pr;
                            })
                /**
                 * TODO ~  invalidate Audience on Product upgrade, (audience should have functional dependency)
                 * i.e. it's always curve that fades down
                 * so growth should be a function or at least some coeficient to odd-binomial (or some) function
                 *
                 * so as growth - conversion & satisfaction
                 */
                    );


                //
                if (p.reward.audience)
                    rewards.push(
                        (new Audience(this.ga)).findById(p.audience._id || p.audience)
                            .then((a:Audience) =>
                                a.populate({
                                    growth: a.growth + (p.reward.audience.growth || 0) ,
                                    size: a.size + (p.reward.audience.size || 0) ,
                                    conversion: a.conversion + (p.reward.audience.conversion || 0) ,
                                    converted: a.converted + (p.reward.audience.converted || 0) ,
                                    satisfaction: a.satisfaction + (p.reward.audience.satisfaction || 0)
                                }).save()
                            )
                    );

                return Promise.all(rewards);
            })
            .then(() => [])
    }
}

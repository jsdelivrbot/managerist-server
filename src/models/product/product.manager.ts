import { Product } from ".";
import { Event } from "..";
import { ProductionStats } from "../company/departments/production/stats";
import { MarketingStats } from "../company/departments/marketing/stats";
import { HrStats } from "../company/departments/hr/stats";
import { Audience } from "../audience";
import { AudienceManager } from "../audience/audience.manager";
import { U } from "../../common";

export class ProductManager {
    protected _initialized = false;
    constructor(
        protected _product:Product, 
        protected _prodStats:ProductionStats = null,
        protected _marketStats:MarketingStats = null,
        protected _hrStats:HrStats = null
    ) {
        if (!this._product._id)
            throw new Error('Whadda u do? Pls, provide full product obj, not the refference.');
        this.init();
    }

    get isInitialized() {
        return this._initialized;
    }

    init():Promise<boolean> {
        return Promise.resolve(true)
            .then(() => this._initialized = true);
    }

    checkUpdates(from:Date, to:Date):Promise<Event[]> {
        let ev:Event[],
            secondsPassed:number = (to.getTime() - from.getTime())/1000;

        return (new Audience(this._product.ga)).findAll({product: this._product._id})
            .then((auds:Audience[]) => 
                Promise.all(
                    auds.map(aud => 
                        new AudienceManager(aud, this._marketStats, this._prodStats, this._hrStats)
                            .updateReaction(from, to)
                    )
                )
            )
            .then((auds:Audience[]) => 
                this._product.populate({
                    monthly: U.sum(auds.map(aud => aud.priceMultiplier * this._product.price * aud.converted))
                })
            )
            .then(() => this._product.invalidateNet())
            .then(() => this._product.save())
// TODO            
            .then(() => ev)
    }
}
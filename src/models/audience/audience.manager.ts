import { Audience, AudienceFactory } from ".";
import { MarketingStats } from "../company/departments/marketing/stats";
import { ProductionStats } from "../company/departments/production/stats";
import { HrStats } from "../company/departments/hr/stats";
import { FeatureImplementation } from "../feature.implementation";
import { FeatureValue } from "../feature";
import { Product, Event } from "..";

export class AudienceManager {
    protected _initialized = false;
    protected _product:Product;
    constructor(
        protected _audience:Audience, 
        protected _marketStats:MarketingStats = null,
        protected _prodStats:ProductionStats = null,        
        protected _hrStats:HrStats = null
    ) {
        if (!this._audience._id)
            throw new Error('Whadda u do? Pls, provide full audience obj, not the refference.');
        this.init();
    }

    get isInitialized() {
        return this._initialized;
    }

    init():Promise<boolean> {
        let pProduct = this._audience.product._id
            ? Promise.resolve(this._audience.product)
            : (new Product(this._audience.ga)).findById(this._audience.product);

        return pProduct
            .then((p:Product) => this._product = p)
            .then(() => this._initialized = true);
    }

    /**
     * update Audiences according to passed time and possible improvements/worsening of FeatureImplementations
     * 
     * @param from Date
     * @param to Date
     * @returns Promise<Audience>
     */
    updateReaction(from:Date, to:Date):Promise<Audience> {
        let ev:Event[],
            monthsPassed:number = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 30),
            fv:FeatureValue[] = this._audience.features,
            fi:FeatureImplementation[],
            efficiency = 0,
            salesEfficiency = 0;

        return this.init()
            .then(() => fi = this._product.features)
            .then(() => this._marketStats.efficiency)
            .then((e:number) => efficiency = e)
            .then(() => this._marketStats.salesEfficiency)
            .then((es:number) => salesEfficiency = es)
            .then(() => {
                return this._audience
                    .populate({
                        size: Math.max(0, this._audience.size + this._audience.growth * monthsPassed),
                        satisfaction: this._audience.calcSatisfaction(this._product.features)
                    })
                    .populate({
                        conversion: this._audience.calcConversion(salesEfficiency),
                        growth: this._audience.calcGrowth(efficiency)
                    })
                    .populate({
                        converted: Math.max(Audience.basicSize * Math.random(), this._audience.size + this._audience.conversion * monthsPassed)
                    })
                    .save();
            })
            .then(() => this._audience);
    }
}
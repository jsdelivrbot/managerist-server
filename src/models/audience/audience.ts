import {Audience as AudienceCommon} from '../../common/models/audience';
export {Audience as AudienceCommon} from '../../common/models/audience';
import {GameBased} from "../game.based";
import {SchemaTypes} from "../../core/db/active.record";
import {Product} from "../product";
import {MarketingStats} from "../company/departments/marketing/stats";
import {Company} from "../company";
import {U} from "../../common/u";
import {FeatureValue} from "../feature";
import {FeatureImplementation} from '../feature.implementation'

/**
 * Class Audience
 *
 * to represent users of the certain product
 *
 */
export class Audience extends GameBased {
    protected static _basicSize = 100;
    protected static _basicGrowth = 0.1;
    static get basicSize() { return Audience._basicSize;};
    /** @property basicGrowth number ~ ppl/day */
    static get basicGrowth():number { return Audience._basicGrowth;};
    
    // common
    name: string;
    size: number;
    conversion: number;
    converted: number;
    satisfaction: number;
    growth: number;
    product: Product;
    features: FeatureValue[];
    priceMultiplier: number;

    protected _common = AudienceCommon;
    protected _schema: any = {
        product: SchemaTypes.ObjectId,
        features: SchemaTypes.Mixed
    }

    /**
     * calcSatisfaction
     *
     *  calculate current satisfaction
     *
     * @param implementations
     * @returns {number}
     */
    public calcSatisfaction(implementations:FeatureImplementation[]) {
        let matchFeatureValue = (f:any):FeatureValue => (<any>this).features.find(
                (_fv:any) => {
                    return (_fv.feature.feature._id || _fv.feature.feature).toString() == f
                }
            ),
            satisfaction = 0;

        for (let fi of implementations) {
            let mf = matchFeatureValue((fi.feature._id || fi.feature).toString());
            satisfaction += fi.quality * mf.value / implementations.length;
        }

        return satisfaction;
    }

    /**
     * calcGrowth
     * 
     * calculate growth
     * @todo improve logic of growth calculation
     * 
     * @returns number
     */
    public calcGrowth(promotionEfficiency:number): number {
        return Math.max(Audience._basicGrowth, Audience._basicGrowth*promotionEfficiency*2)
        + ((<any>this).satisfaction || 0 - 0.5);
    }
}
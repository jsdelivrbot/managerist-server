import {Audience as AudienceCommon} from '../../common/models/audience';
export {Audience as AudienceCommon} from '../../common/models/audience';
import {GameBased} from "../game.based";
import {SchemaTypes, ActiveRecord} from "../../core/db/active.record";
import {Product} from "../product";
import {FeatureValue} from "../feature";
import {FeatureImplementation} from '../feature.implementation'
import { AudienceHistory } from './audience.history';

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
    /** @property basicGrowth number ~ ppl/month */
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
     * save
     *
     * override create/update to store history for Audience
     *
     * @returns {Promise<Audience>}
     */
    save(): Promise<Audience|ActiveRecord> {
        let savePromise: Promise<Audience|ActiveRecord> = this._id
            ? this._update(this.common)
            : this._create(this.common),
            ar: Audience;
        return savePromise
            .then((_a: any) => {
                ar = _a;
                (new AudienceHistory(ar)).save()
            })
            .then(() => ar);
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
                    return (_fv.feature._id || _fv.feature).toString() == f
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

    /**
     * calcConversion
     * 
     * calculate conversion
     * @todo TBD calculate competitivity of the our product market
     * 
     * @returns number
     */
    public calcConversion(salesEfficiency:number): number {
        let competition: number = 0.5; // TODO
        return ((<any>this).satisfaction || 0) * salesEfficiency - competition;
    }    
}
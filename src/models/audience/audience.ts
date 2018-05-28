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
    name: string;
    size: number;
    conversion: number;
    converted: number;
    satisfaction: number;
    growth: number;

    features: FeatureValue[] = [];

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
        let matchFeatureValue = (f:any):FeatureValue => (<any>this).features.find((_fv:any) => _fv.feature == f),
            satisfaction = 0;

        for (let fi of implementations) {
            let mf = matchFeatureValue(fi.feature);
            satisfaction = satisfaction
                + fi.quality*matchFeatureValue(fi.feature).value/implementations.length;
        }

        return satisfaction;
    }
}
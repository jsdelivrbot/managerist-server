import {Company} from "../company/company";
import {Product} from "../product/product";
import {MarketingStats} from "../company/departments/marketing/stats";
import {FeatureValue} from "../feature";
import {Audience} from "./audience";
import {U} from "../../common/u";

/**
 * Class AudienceFactory
 */
export class AudienceFactory {
    protected static _basicSize = 100;
    protected static _basicGrowth = 0.1;

    private _product:Product;

    constructor(private _company:Company) {
        if (!_company._id)
            throw new Error('AudienceFactory: Company should be full, not a reference.');
    }

    /**
     *
     * @param product
     * @returns {Audience}
     */
    public generate(product:Product|any) {
        if (!product._id)
            throw new Error('AudienceFactory: Product should be full, not a reference.');
        this._product = product;

        //noinspection TypeScriptValidateTypes
        let stats:MarketingStats = new MarketingStats(this._company),
            efficiency = 0;

        return stats.efficiency
            .then((e:number) => efficiency = e)
            .then(() => {
                let featureValues:FeatureValue[] = this.genFeatureValues(this._product.features, 1),
                    a = (new Audience(this._product.ga));
                return a
                    .populate({
                        product: this._product._id,
                        name: U.featureName(),
                        /*** @todo improve logic of starting count calculation **/
                        size: Math.max(AudienceFactory._basicSize, AudienceFactory._basicSize*efficiency*2),
                        conversion: 0,
                        converted: 0,
                        features: featureValues
                    })
                    .populate({
                        satisfaction: a.calcSatisfaction(this._product.features)
                    })
                    .populate({
                        /*** @todo improve logic of growth calculation **/
                        growth: Math.max(AudienceFactory._basicGrowth, AudienceFactory._basicGrowth*efficiency*2)
                        + ((<any>this).satisfaction || 0 - 0.5)
                    })
                    .save();
            })
    }

    /**
     * genFeatureValues
     *
     * generate featureValues distribution out of features list, and randomly set some of them as "key"
     *
     * @param featureIds
     * @param keyCount
     * @returns {FeatureValue[]}
     */
    public genFeatureValues(featureIds:any[], keyCount = 1) {
        let featureValues:FeatureValue[] = [],
            value = 1,
            kinv = featureIds.length/2 <= keyCount;
        for (let i=0; i<featureIds.length; i++) {
            let fi = featureIds[i],
                tval = i == featureIds.length -1
                    ? value
                    : Math.random() * value/(featureIds.length - featureValues.length);
            //noinspection TypeScriptValidateTypes
            featureValues.push(new FeatureValue(
                fi.feature,
                kinv,
                tval
            ));

            value -= tval;
        }

        if (kinv) keyCount = featureValues.length - keyCount;
        if (keyCount>0)
            while(keyCount) {
                let ri = Math.floor(featureValues.length * Math.random());
                if (featureValues[ri].key == !kinv) continue;
                featureValues[ri].key = !kinv;
                keyCount--;
            }
        return featureValues;
    }
}
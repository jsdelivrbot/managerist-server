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
    private _product:Product;

    constructor(private _company:Company) {
        if (!_company._id)
            throw new Error('AudienceFactory: Company should be full, not a reference.');
    }

    /**
     * generate
     * 
     * actually Audience Factory
     * 
     * @param product
     * @returns Audience
     */
    public generate(product:Product|any) {
        if (!product._id)
            throw new Error('AudienceFactory: Product should be full, not a reference.');
        this._product = product;

        //noinspection TypeScriptValidateTypes
        let stats:MarketingStats = new MarketingStats(this._company),
            efficiency = 0;

        return stats.init()
            .then(() => stats.efficiency)
            .then((e:number) => efficiency = e)
            .then(() => {
                let featureValues:FeatureValue[] = this.genFeatureValues(this._product.features.map(f => f.feature._id || f.feature), 1),
                    a = (new Audience(this._product.ga));
                return a
                    .populate({
                        product: this._product._id,
                        name: U.featureName(),
                        size: this.calculateStartingSize(efficiency),
                        conversion: 0,
                        converted: 0,
                        features: featureValues
                    })
                    .populate({
                        satisfaction: a.calcSatisfaction(this._product.features)
                    })
                    .populate({
                        growth: a.calcGrowth(efficiency)
                    })
                    .save();
            })
    }

    /**
     * determine starting Audience size
     * @todo improve logic of starting count calculation
     * 
     * @param promotionEfficeincy 
     */
    public calculateStartingSize(promotionEfficeincy: number) {
        return Math.max(Audience.basicSize, Audience.basicSize*promotionEfficeincy*2);
    }

    /**
     * genFeatureValues
     *
     * generate featureValues distribution out of features list, and randomly set some of them as "key"
     *
     * @param featureIds
     * @param keyCount
     * @returns FeatureValue[]
     */
    public genFeatureValues(featureIds:any[], keyCount = 1):FeatureValue[] {
        let featureValues:FeatureValue[] = [],
            distribution = U.dstr(featureIds.length),
            keyValues = U.bigX(distribution, keyCount);
        return featureIds.map((f, i) => 
            new FeatureValue(f, keyValues.includes(distribution[i]), distribution[i])
        );
    }
}
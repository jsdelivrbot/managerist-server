import {
    Feature as FeatureCommon,
    FeatureImplementation as FeatureImplementationCommon,
    FeatureValue as FeatureValueCommon
} from "../../common/models/feature";
export {Feature as FeatureCommon} from '../../common/models/feature';
import {GameBased} from "../game.based";
import {SchemaTypes} from "../../core/db/active.record";

import {Product, ProductCommon} from "../product";
import {Technology, KnownBranch, TechnologyUsage} from "../technology";
import {U} from "../../common/u";
import { Company } from "../company";
import { FA } from "../../common/fa";

export class Feature extends GameBased {
    // common
    name: string;
    ico: string;
    complexity: number;
    volume: number;
    implementations:TechnologyUsage[][];
    //TBD: industry: Industry
    branch: Technology;
    inventor: Company;

    protected static _defaultVolume = 259200; // 60*60*24*3  ~ 3 days of work
    protected static _defaultAllowedBugs = 100; // 100 per 1 default size  ^_^
    protected _common = FeatureCommon;
    protected _schema: any = {
        branch: SchemaTypes.ObjectId,
        inventor: SchemaTypes.ObjectId,
        implementations: SchemaTypes.Mixed
    }

    /**
     * defaultVolume
     *
     * @returns {number}
     */
    static get defaultVolume() {
        return Feature._defaultVolume;
    }

    /**
     * defaultAllowedBugs
     *
     * @returns {number}
     */
    static get defaultAllowedBugs() {
        return Feature._defaultAllowedBugs;
    }

    /**
     * generateForProduct
     *
     * creates the list of features that may be applied for the new Product
     *
     * @param product
     * @param cnt
     * @returns Promise<Feature[]>
     */
    static generateForProduct(product: Product|any, cnt:number): Promise<Feature[]> {
        let ga = product.ga,
            far:Feature = new Feature(ga),
            generated: Feature[] = [];

        // TBD ~ variate features search/create by technologies applied/adopted in product
        return far.findAll({
                branch: Technology.getKnownBranch(KnownBranch.Programming)
            })
            .then((_exF:Feature[]|null) => {
                let res = [],
                    fnew = 0,
                    fold = 0;
                if (!_exF || _exF.length < cnt) {
                    fnew = cnt;
                } else {
                    fnew = 1;
                    fold = cnt - 1;
                }
                return Promise
                    // Generate new Features
                    .all(U.a(fnew).map(() => {
                        return (new Feature(product.ga, {
                            branch: Technology.getKnownBranch(KnownBranch.Programming),
                            inventor: product.company,
                            complexity: Feature.defaultVolume,
                            name: U.featureName(),
                            icon: FA.faIcon()
                        })).save()
                    }))
                    // then fill the rest with existed
                    .then((_F:Feature[]) =>
                        _F.concat(...U.a(fold).map(() =>
                            _exF.splice(Math.random() * _exF.length, 1)[0]
                        ))
                    );
            });
    }
}

/**
 * Class FeatureValue
 *
 *  Overloading common (possibbly will be stored in DB)
 */
export class FeatureValue extends FeatureValueCommon {}
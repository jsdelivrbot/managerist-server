import {Product as ProductCommon, ProductStage, ProductArea} from '../../common/models/product';
import {SchemaTypes, ActiveRecordRule, ActiveRecordRulesTypes} from "../../core/db/active.record";
import {GameBased} from "../game.based";
import {FeatureImplementation} from "../feature.implementation";

export {Product as ProductCommon, ProductStage, ProductArea} from '../../common/models/product';

export class Product extends GameBased {
    // common
    monthly: number;
    name: string;
    net: number;
    bugRate: number;
    tdRate: number;

    features: FeatureImplementation[];

    protected _common = ProductCommon;
    protected _schema:any = {
        stage: String,
        area: String,
        company: SchemaTypes.ObjectId,
        features: SchemaTypes.Mixed
    }

    get rules():{[key:string]:ActiveRecordRule} {
        return {
            stage: {type:ActiveRecordRulesTypes.ENUM, related: ProductStage},
            area: {type:ActiveRecordRulesTypes.ENUM, related: ProductArea},
            //reward: {type: ActiveRecordRulesTypes.CUSTOM, related: ProjectResults}
        };
    }
}

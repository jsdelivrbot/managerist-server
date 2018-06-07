import {Product as ProductCommon, ProductStage, ProductArea} from '../../common/models/product';
import {SchemaTypes, ActiveRecordRule, ActiveRecordRulesTypes} from "../../core/db/active.record";
import {GameBased} from "../game.based";
import {FeatureImplementation} from "../feature.implementation";
import { Project } from '..';
import { U } from '../../common';

export {Product as ProductCommon, ProductStage, ProductArea} from '../../common/models/product';

export class Product extends GameBased {
    // common
    monthly: number;
    name: string;
    net: number;
    bugRate: number;
    tdRate: number;
    stage: ProductStage;
    price: number;

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

    static get activeStagesS()
    {
        return [
            U.e(ProductStage, ProductStage.Alpha),
            U.e(ProductStage, ProductStage.Beta),
            U.e(ProductStage, ProductStage.Active),
            U.e(ProductStage, ProductStage.Maintenance)
        ]
    }
    
    /**
     * Invalidate product overall value (that may be proposed by investors to buyout product)
     */
    invalidateNet():Promise<Product> {
        
        // TODO
        this.net = this.net;

        return Promise.resolve(true)
            .then(() => this);
    }

    invalidateStatus():Product
    {
        if (!U.sumo(this.features, 'isDesigned')) {
            this.stage = ProductStage.Idea;
            return this;
        }
        let fvSum = U.sumo(this.features, 'version');
        if (fvSum < this.features.length) {
            this.stage = ProductStage.Planned;
        }
        if (fvSum == this.features.length) {
            this.stage = ProductStage.Alpha;
            return this;
        }

        if (U.en(ProductStage, this.stage) == ProductStage.Alpha) {
            this.stage = ProductStage.Beta;
            return this;
        }

        if (U.en(ProductStage, this.stage) == ProductStage.Beta) {
            this.stage = ProductStage.Active;
            return this;
        }
        // Active, Maintenance, Closed do not changes 
        return this;
    }

    get isRun()
    {
        return [ProductStage.Planned, ProductStage.Idea, ProductStage.Closed].includes(U.en(ProductStage, this.stage));
    }
}

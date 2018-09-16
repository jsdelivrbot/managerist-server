import { AudienceHistory as AudienceHistoryCommon } from '../../common/models/audience.history';
export { AudienceHistory as AudienceHistoryCommon } from '../../common/models/audience.history';
import { GameBased } from "../game.based";
import { SchemaTypes } from "../../core/db/active.record";
import { FeatureValue } from "../feature";
import { Audience } from './audience';
import { GameActivity } from '../game';

/**
 * Class Audience
 *
 * to represent users of the certain product
 *
 */
export class AudienceHistory extends GameBased {
    audience: Audience;
    date: Date;
    size: number;
    conversion: number;
    converted: number;
    satisfaction: number;
    growth: number;
    features: FeatureValue[];
    priceMultiplier: number;

    protected _common = AudienceHistoryCommon;
    protected _schema: any = {
        audience: SchemaTypes.ObjectId,
        date: SchemaTypes.Date,
        features: SchemaTypes.Mixed
    }

    constructor(a: GameActivity|Audience, data?:any) {
        super(a instanceof Audience ? a.ga : a, data);
        if (a instanceof Audience) {
            let ddata:any = a.common;
            ddata.audience = a._id;
            ddata.date = a.ga.time;
            delete ddata._id;
            this.populate(ddata, true);
        }
        return this;
    }

    get common() {
        let cmn = super.common;
        return cmn;
    }
}
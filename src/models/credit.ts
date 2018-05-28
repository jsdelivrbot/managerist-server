import {Credit as CreditCommon} from '../common/models/credit'
import {GameBased} from "./game.based";
import {SchemaTypes} from "../core/db/active.record";

export class Credit extends GameBased {
    private _basicWorkload:number = 10; // min 10h needed for simple credit
    private _minAmount:number = 5000;  // min amount
    private _ordinalPercent:number = 0.2;  // ordinal percentage
    protected _common = CreditCommon;
    protected _schema: any = {
        company: SchemaTypes.ObjectId
    }

    get workload():number {
        return this._basicWorkload
            + 0.5 * (<any>this).amount / this._minAmount
            + 10 * ((<any>this).percent / this._ordinalPercent);
    }
}
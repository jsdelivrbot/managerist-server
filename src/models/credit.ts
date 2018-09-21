import {Credit as CreditCommon} from '../common/models/credit'
import {GameBased} from "./game.based";
import {SchemaTypes} from "../core/db/active.record";

export class Credit extends GameBased {
    // common
    creditor: string;
    amount: number;
    nextPayment: number;
    percent: number;
    created: number; // timestamp
    deadline: number; // timestamp
    company: any;

    private static _basicWorkload:number = 10; // min 10h needed for simple credit
    private static _minAmount:number = 5000;  // min amount
    private static _ordinalPercent:number = 0.2;  // ordinal percentage

    static get randomBank(): string {
        return ["Agricultural Bank of China", " Mitsubishi UFJ", "JP Morgan", " HSBC Holdings", "BNP Paribas", "Bank of America", "Deutsche Bank", "Banco Standarter"][Math.floor(Math.random() * 7)];
    }

    static get basicWorkload() :number {
        return Credit._basicWorkload;
    }

    static get minAmount() :number {
        return Credit._minAmount;
    }
    
    static get ordinalPercent() :number {
        return Credit._ordinalPercent;
    }    

    protected _common = CreditCommon;
    protected _schema: any = {
        company: SchemaTypes.ObjectId,
        created: SchemaTypes.Date,
        deadline: SchemaTypes.Date
    }

    get workload():number {
        return Credit._basicWorkload
            + 0.5 * (<any>this).amount / Credit._minAmount
            + 10 * ((<any>this).percent / Credit._ordinalPercent);
    }
}
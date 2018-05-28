import {Credit as CreditCommon} from '../common/models/credit'
import {GameBased} from "./game.based";
import {SchemaTypes, ActiveRecord} from "../core/db/active.record";

class LogCommon {
    model: string = '';
    data: string = '';
    date: Date = new Date;
}
export class Log extends GameBased {
    protected _common = LogCommon;
    protected _schema: any = {
        company: SchemaTypes.ObjectId
    }


}

class LogRecord {
    archive(ar:ActiveRecord) {
        return {
            model: ar.constructor.name,
            data: ar.common
        };
    }
}
import {AlertType as AlertTypeCommon, AlertLevel} from "../../common/models/alert.type"
export {AlertType as AlertTypeCommon, AlertLevel} from "../../common/models/alert.type"

import {DictionaryRecord} from "../../core/db/dictionary.record";
import {Department} from "../department";
import {SchemaTypes} from "../../core/db/active.record";

/**
 * Class AlertType
 *
 * @property name string
 */
export class AlertType extends DictionaryRecord {
    // common
    department: Department|any;
    name:string;

    protected _common: any = AlertTypeCommon;
    protected _schema:any = {
        department: SchemaTypes.ObjectId,
        level: String
    };
}

import {ActionType as ActionTypeCommon} from "../../common/models/action.type"
export {ActionType as ActionTypeCommon} from "../../common/models/action.type"

import {DictionaryRecord} from "../../core/db/dictionary.record";
import {Department} from "../department";

/**
 * Class EventType
 *
 * @property name string
 */
export class ActionType extends DictionaryRecord {
    // common
    department: Department|any;
    name:string;

    protected _common: any = ActionTypeCommon;
}

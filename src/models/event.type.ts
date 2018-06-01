import {EventType as EventTypeCommon} from "../common/models/event.type"
export {EventType as EventTypeCommon} from "../common/models/event.type"

import {DictionaryRecord} from "../core/db/dictionary.record";
import {Department} from "./department";
import * as EventTypeClasses from './event_type/index';
import {BaseEventTypeInterface} from "./event_type/base.eventtype";

/**
 * Class EventType
 *
 * @property name string
 */
export class EventType extends DictionaryRecord {
    // common
    department: Department|any;
    name:string;
    action: boolean;

    protected _common: any = EventTypeCommon;

    /**
     *
     * @returns {any}
     */
    get typeClass():BaseEventTypeInterface {
        let name = this.name.replace(' ', ''),
            $class = ((<any>EventTypeClasses)[name + 'EventType']);
        if (!$class)
            throw new Error('Unimplemented Event ~ ' + name);

        return <any>$class;
    }
}

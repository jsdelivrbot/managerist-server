import {Alert as AlertCommon} from '../../common/models/alert';
export {Alert as AlertCommon} from '../../common/models/alert';
import {SchemaTypes, ActiveRecordRule, ActiveRecordRulesTypes, ActiveRecordError} from "../../core/db/active.record";
import {GameBased} from "../game.based";
import {AlertType} from "./alert.type";

import {EventEmitter} from "events"

export class Alert extends GameBased {
    // common
    type:AlertType;

    private static _dbOperations:EventEmitter = new EventEmitter();
    public static onUpdates(cb:Function) {
        Alert._dbOperations.on('save', cb);
    }

    protected _common:any = AlertCommon;
    protected _schema:any = {
        type: SchemaTypes.ObjectId,
        department: SchemaTypes.ObjectId,
        company: SchemaTypes.ObjectId,
        date: SchemaTypes.Date
    };

    public get rules(): { [key: string]: ActiveRecordRule } {
        return {
            'type': {type: ActiveRecordRulesTypes.BELONGS, related: AlertType, external: true}
        };
    }

    // info about last action (process) to be able to undo
    protected _processDetails:any;

    get processDetails() {
        return this._processDetails;
    }
    set processDetails(d:any) {
        this._processDetails = d;
    }

    /**
     * save
     *
     * overrided to always populate "type" on save/.
     *
     * @returns {Promise<Event>}
     */
    save():Promise<Alert> {
        this.withRelations(['type']);
        return <Promise<Alert>>super.save()
            .then(() => {
                Alert._dbOperations.emit('save', this.common);
                return this;
            });
    }

    /**
     * populate
     *
     * overrided to always populate "type" on save/.
     *
     * @param data
     * @param force
     * @returns {Event}
     */
    populate(data:any = {}, force:boolean = false):Alert {
        data.type = data.type || this.type;
        return <Alert>super.populate(data, force);
    }

    /**
     *
     * @returns Promise<Event[]>
     */
    resolve():Promise<Alert> {
        return this.populate({resolved:true}).save();
    }

    /**
     *
     * @returns Promise<Event[]>
     */
    ignore():Promise<Alert> {
        return this.populate({ignored:true}).save();
    }
}

import {Event as EventCommon} from '../common/models/event';
export {Event as EventCommon} from '../common/models/event';
import {SchemaTypes, ActiveRecordRule, ActiveRecordRulesTypes, ActiveRecordError} from "../core/db/active.record";
import {GameBased} from "./game.based";
import {Project} from "./project";
import {BaseEventTypeInterface} from "./event_type/base.eventtype";
import {Company} from "./company";
import {EventType} from "./event.type";

export class Event extends GameBased {
    public type:EventType;
    public date:Date;
    public details:any;
    public company:Company|any;
    public project?:Project|any;

    protected _parent:any;
    protected _children:any[];

    protected _common:any = EventCommon;
    protected _schema:any = {
        type: SchemaTypes.ObjectId,
        date: SchemaTypes.Date,
        parent: SchemaTypes.ObjectId,
        children : SchemaTypes.Mixed,
        details : SchemaTypes.Mixed
    };
        // info about last action (process) to be able to undo
    protected _processDetails:any;

    get rules():{[key:string]:ActiveRecordRule} {
        return {
            type: {type:ActiveRecordRulesTypes.ENUM, related: EventType}
        };
    }
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
    save():Promise<Event> {
        this.withRelations(['type']);
        return <Promise<Event>>super.save();
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
    populate(data:any = {}, force:boolean = false):Event {
        data.type = data.type || this.type;
        return <Event>super.populate(data, force);
    }


    /**
     *
     * @returns BaseEventTypeInterface
     */
    get typeClass():any {
        if (!this.type._id)
            throw new ActiveRecordError('Method not available, "eventType" not loaded');

        return this.type.typeClass;
    }

    /**
     *
     * @returns Promise<Event[]>
     */
    process():Promise<Event[]> {
        return (new this.typeClass(this.ga, this.type)).process(this);
    }
}

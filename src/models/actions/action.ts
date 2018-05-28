import {Action as ActionCommon} from '../../common/models/action';
export {Action as ActionCommon} from '../../common/models/action';
import {SchemaTypes, ActiveRecordRule, ActiveRecordRulesTypes, ActiveRecordError} from "../../core/db/active.record";
import {GameBased} from "../game.based";
import {Project} from "../project";
import {BaseActionTypeInterface} from "./base.actiontype";
import {Company} from "../company";
import {ActionType} from "./action.type";

export class Action extends GameBased {
    public type:ActionType;
    public date:Date;
    public details:any;
    public company:Company|any;

    protected _common:any = ActionCommon;
    protected _schema:any = {
        type: SchemaTypes.ObjectId,
        date: SchemaTypes.Date,
        details : SchemaTypes.Mixed
    };

    get rules():{[key:string]:ActiveRecordRule} {
        return {
            type: {type: ActiveRecordRulesTypes.BELONGS, related: ActionType, external: true},
        };
    }

    /**
     * save
     *
     * overrided to always populate "type" on save/.
     *
     * @returns {Promise<Action>}
     */
    save():Promise<Action> {
        this.withRelations(['type']);
        return <Promise<Action>>super.save();
    }

    /**
     * populate
     *
     * overrided to always populate "type" on save/.
     *
     * @param data
     * @param force
     * @returns {Action}
     */
    populate(data:any = {}, force:boolean = false):Action {
        data.type = data.type || this.type;
        return <Action>super.populate(data, force);
    }
}

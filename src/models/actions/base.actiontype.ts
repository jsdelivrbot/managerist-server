import {Game, GameActivity} from "../game";
import {Company} from "../company";
import {ActionType} from "./action.type";
import {Action} from "./action";

export abstract class BaseActionType {
    protected _ga:GameActivity;
    protected _game:Game;
    protected _type:ActionType;
    protected _date:Date;
    protected _company:Company|any;

    get ga() {
        return this._ga;
    }

    constructor(ga:GameActivity, type:any = null) {
        this._type = type || (<ActionType>ActionType.getByName(this.constructor.name.replace('ActionType', '')));
        this._ga = ga;
        this._date = new Date(ga.time);
    }

    /**
     *
     * @returns {Promise<Game>}
     */
    get game(): Promise<Game> {
        if (this._game)
            return new Promise<Game>(() => this._game);

        return (new Game).findById(this.ga.gameId)
            .then((g:Game) => {
                this._game = g;
                return this._game;
            })
    }

    set company(c:Company|any) {
        this._company = c;
    }
    get company() {
        return this._company;
    }

    get type() {
        return this._type;
    }

    get typeString() {
        return this._type.name;
    }

    // Generate type-related data for event
    get actionDetails():any  {
        return {
            type: this._type._id,
            description: 'Something happend',
            details: {}
        }
    }

    /**
     *
     * @param data
     * @returns {any}
     */
    public do(data?:{date:Date, company:any, [propName: string]: any}): Promise<Action> {
        // ~ do something
        this._date = (data && data.date) || this._date;
        return (new Action(this.ga))
            .populate({
                type: this._type._id,
                date: this._date
            })
            .populate(data || {})
            .populate(this.actionDetails)
            .save();
    }
}
export interface BaseActionTypeInterface {
    new(ga:GameActivity, type:ActionType):BaseActionType;
}


export interface CustomerEventType {}
export interface EmployeeEventType {}

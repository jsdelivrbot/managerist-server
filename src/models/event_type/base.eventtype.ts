import {ActiveRecord} from "../../core/db/active.record";
import {Game, GameActivity} from "../game";
import {Company} from "../company";
import {Event} from "../event";
import {EventType} from "../event.type";
import {isNumber} from "util";

export /* abstract */ class BaseEventType {
    //common
    name: string;

    protected _ga:GameActivity;
    protected _game:Game;
    protected _type:EventType;

    protected _period:number = 3600000; // 1h
    protected _probability:number = 1; // 100%

    get ga() {
        return this._ga;
    }

    constructor(ga:GameActivity, type:EventType = null) {
        this._type = type || (<EventType>EventType.getByName(this.constructor.name.replace('EventType', '')));
        this._ga = ga;
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

    get type() {
        return this._type;
    }

    get typeString() {
        return this._type.name;
    }

    get period() {
        let p = this.probabilistic ? (Math.round(Math.random() * this._period)): this._period;
        return p;
    }
    get probability():Promise<number> {
        return Promise.resolve(this._probability);
    };
    get probabilistic() {return this._probability && (this._probability != 1);}
    get generic() {return !this._probability && !this._period;}

    get throw():Promise<boolean> {
        return this.probability.then((p:number) =>  {
            let rnd = Math.random();
            return p && (p > rnd);
        });
    }

    // Generate type-related data for event
    get eventData():any  {
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
    public createEvent(data:{date:Date, company:any, [propName: string]: any}): Promise<Event|ActiveRecord> {
        return (new Event(this.ga))
            .populate(data)
            .populate(this.eventData)
            .save();
    }

    /**
     * previous
     *
     * get previous event of the same type
     *
     * @param type
     * @param date
     * @param companyId
     * @return {any}
     */
    previous(date:number, companyId: any): Promise<Event> {
        return (new Event(this._ga))
            .sort({date: -1})
            .find({
                company: companyId,
                type: this.typeString,
                //date: {$gt: date - this.period}
            })
            .then((ar:any) => <Event>ar);
    }
}
export interface BaseEventTypeInterface {
    new(ga:GameActivity, type:EventType):BaseEventType;
}


export interface CustomerEventType {}
export interface EmployeeEventType {}

import {ActiveRecord, ActiveRecordInterface} from "../core/db/active.record";
import {GameActivity} from "./game";
import {Managerist} from "../app";

export interface GameBasedInterface extends ActiveRecordInterface {
    new (a:GameActivity, data?:any) : GameBased;
}
export abstract class GameBased extends  ActiveRecord {
    //common
    _id:any;

    protected _ga:GameActivity;
    /**
     *
     * @param activity
     * @param data
     * @returns {GameBased}
     */
    constructor(activity:GameActivity, data?:any) {
        super(data || {});
        this._ga = activity;
        return this;
    }

    /**
     *
     * @param cond
     */
    findAll(cond?:any): Promise<ActiveRecord[]> {
        return super.findAll(cond)
            .then((ar:ActiveRecord[]) => ar.map(a => a.constructor(this.ga, a)));
    }

    /**
     *
     * @param cond
     * @param populate
     * @return {Promise<ActiveRecord|null|ActiveRecord>}
     */
    find(cond:any = {}, populate: boolean = true): Promise<ActiveRecord|null> {
        return super.find(cond, populate)
            .then((ar:ActiveRecord|null) => ar && ar.constructor(this.ga, ar));
    }

    /**
     *
     * @returns {GameActivity}
     */
    get ga(): GameActivity {
        return this._ga;
    }

    /**
     *
     * @returns {string}
     */
    get connection() {
        if (!this._connection) {
            this._connection = Managerist.newGameConnection(this._ga.gameId);
        }
        return this._connection;
    }

    /**
     *  Forbidden for GameBased, because solely derives from Activity
     * @param conn
     */
    set connection(conn:string) {
        return;
    }
}
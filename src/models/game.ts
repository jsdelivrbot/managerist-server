import {Game as GameCommon, GameStarterBonus, GameOptions as GameOptionsCommon, GameDifficulty} from '../common/models/game';
export {GameStarterBonus, GameDifficulty, Game as GameCommon} from '../common/models/game';

import {SchemaTypes, ActiveRecord, ActiveRecordRulesTypes, ActiveRecordRule} from "../core/db/active.record";
import {Event} from "./event";
import {Token, TokenType} from "./token";
import {User} from "./user";

/**
 * Class GameActivivity
 *
 * class to represent action that may be processing in the current cycle
 */
export class GameActivity {
    constructor(
        public userId:any,
        public gameId:any,
        public time?:number
    ) {
        this.time = time || (new Date).getTime();
    }
}

export class GameOptions extends GameOptionsCommon {
    get list():any {
        let res:any = {};
        for (let bp of Object.getOwnPropertyNames(this)) {
                res[bp] = (<any>this)[bp];
        }
        return res;
    }
}

/**
 * Class Game
 *
 * actually record of the Game
 */
export class Game extends ActiveRecord {
    // Common props
    name: string;
    users: User[];
    setup: any;
    options: GameOptions;
    startDate: Date;
    lastInteraction: Date;
    simulationDate: Date;
    creator: User|any;


    protected _connection:string = 'main';
    protected _common:any = GameCommon;
    protected _schema:any = {
        startDate: SchemaTypes.Date,
        lastInteraction: SchemaTypes.Date,
        simulationDate: SchemaTypes.Date,
        setup: SchemaTypes.Mixed,
        options: SchemaTypes.Mixed,
        users: [{type: SchemaTypes.ObjectId, ref: 'User'}],
        creator: SchemaTypes.ObjectId
    };

    private static _startDate:Date = new Date();
    private static _lastInteractionDate:Date = Game._startDate;
    private static _simulationDate:Date = Game._startDate;

    get rules():{[key:string]:ActiveRecordRule} {
        return {
            starterBonus: {type:ActiveRecordRulesTypes.ENUM, related: GameStarterBonus},
            difficulty: {type:ActiveRecordRulesTypes.ENUM, related: GameDifficulty},
            //reward: {type: ActiveRecordRulesTypes.CUSTOM, related: ProjectReward}
        };
    }

    get ga() {
        return new GameActivity(this.creator._id || this.creator, this._id);
    }

    getToken(userId:any) {
        return Token.createJwt({_id: userId, gameId: this._id}, TokenType.Game)
    }

    /**
     *  Archive all game-database to be able to res
     *
     * @returns {Promise<never>|Promise<T>|Promise<void>}
     */
    archive(): Promise<any> {
        let events = new Event(new GameActivity(this.creator._id || this.creator, this._id))
            .findAll();
        // TODO
        return Promise.reject('Not implemented yet');
    }
}

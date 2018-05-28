import {Mean} from "./core/mean";
import {Game, GameActivity} from "./models/game";
import {Technology} from "./models/technology";
import {MongoTypes} from "./core/db/active.record";
import {Department} from "./models/department";
import {EventType} from "./models/event.type";
import {Role} from "./models/role";
import {AlertType} from "./models/alerts/alert.type";
import {ActionType} from "./models/actions/action.type";

export class Managerist extends Mean {
    private static _activeGames: GameActivity[] = [];
    private static _activityTtl:number/*s*/ = 3600; // 1h ~ Time without any new activity, before DB conection will be closed

    private static _cleanupInterval:number/*ms*/ = 600000; // once in a 10 min
    private static _cleanupTimer:any;

    protected init(port: number, config: any): Promise<any> {
        Managerist._cleanupTimer = setInterval(Managerist._cleanup, Managerist._cleanupInterval);
        return super.init(port, config)
            .then(() => Technology.preload())
            .then(() => Department.preload())
            .then(() => Role.preload())
            .then(() => EventType.preload())
            .then(() => ActionType.preload())
            .then(() => AlertType.preload());
    }

    /**
     *  Cleanup function, to close not used connections and remove activities fom tracking
     *
     * @private
     */
    private static _cleanup(all:boolean = false) {
        let t = (new Date()).getTime() - Managerist._activityTtl,
            outdated = all ? Managerist._activeGames : Managerist._activeGames.filter((a:GameActivity) => a.time < t);
        for(let a of outdated) {
            let d = all
                ? 0
                : Managerist._activeGames
                    .find((dublicate:GameActivity) => dublicate.gameId = a.gameId && dublicate.time >= t);
            if (!d) {
                console.log('Drop DB connection')
                Managerist.db.removeConnection(Managerist.getGameConnection(a.gameId));
            }

            Managerist._activeGames = Managerist._activeGames.filter(
                (stoppedGame:GameActivity) => stoppedGame.gameId == a.gameId
            );
        }
    }

    static getGameConnection(gameId:any) {
        return Managerist.config.db.gameDbPrefix + gameId;
    }

    static newGameConnection(gameId:any):string {
        let dbName = Managerist.getGameConnection(gameId);
        if (Managerist.db.connections[dbName])
            return dbName;
        Managerist.db.addConnection({
            host: Managerist.config.db.host,
            name: dbName,
            db: dbName
        });

        return dbName;
    }

    /**
     * eraseGames
     *
     * remove games (including databases)
     *
     * @param {any[]} gamesList
     * @returns {Promise<boolean>}
     */
    static eraseGames(gamesList:any[]):Promise<boolean> {
        let cond = gamesList.length
            ? {_id: {$in: gamesList.map((sid) => MongoTypes.ObjectId(sid))}}
            : {};
        return (new Game()).findAll(cond)
            .then((gl:any) => gamesList = gl.map((g:any) => g._id))
            .then(() => (new Game()).delete(cond))
            .then(() => console.log('Games dropped in `main` DB'))
            .then(() =>
                Promise.all(
                    gamesList.map((g) =>
                        Managerist.db.connections[Managerist.newGameConnection(g)].dropDatabase()
                    )
                )
            )
            .then(() => true);
    }

    /**
     * Register activity (Game/User/Time, each active game should have open DB connection)
     *
     * @param userId
     * @param gameId
     * @return {any}
     */
    static registerActivity(userId:GameActivity|any, gameId?:any): GameActivity{
        let act = userId instanceof  GameActivity
            ? userId
            : new GameActivity(userId, gameId);

        let prev = Managerist._activeGames.find((v:GameActivity) => v.gameId == act.gameId && v.userId == act.userId);
        if (prev)
            prev.time = (new Date).getTime();
        else {
            Managerist.newGameConnection(act.gameId);
            Managerist._activeGames.push(act);
        }
        return act;
    }

    stop(cb?:Function)
    {
        Managerist._cleanup(true);
        super.stop();
    }
}

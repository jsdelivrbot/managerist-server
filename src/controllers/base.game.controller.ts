import {BaseController} from "../core/base.controller";
import {Game, GameActivity} from "../models/game";
import {UserIdentity} from "../models/user.identity";
import {Managerist} from "../app";
import {User, Company} from "../models";
import {Action} from "../models/actions/action";
import { Log, LogLevel } from "../core/utils/log";



export abstract class BaseGameController extends  BaseController {
    protected _game:Game;
    protected _user:User;
    protected _company:Company;
    protected _currentUser:string;
    protected _currentGame:string;

    /**
     *
     * @param req
     * @return {boolean}
     */
    protected requestCheck(req:any) {
        let jwtData = UserIdentity.checkBearer(req);

        if (jwtData) {
            //noinspection JSAnnotator
            req.session.currentUser = jwtData._id;
            if (jwtData.gameId)
                //noinspection JSAnnotator
                req.session.currentGame = jwtData.gameId;
        }

        this._currentUser = req && req.session
            ? (req.session.currentUser || null)
            : null;
        this._currentGame = req && req.session
            ? (req.session.currentGame || null)
            : null;

        if (this.currentUser && this.currentGame)
            Managerist.registerActivity(new GameActivity(this.currentUser, this.currentGame));

        if (!this.currentUser)
            this._errStatusCode = 401;

        return this.currentUser ? super.requestCheck(req) : false;
    };

    get currentUser() {
        return this._currentUser;
    }

    get currentGame() {
        return this._currentGame;
    }

    get ga():GameActivity {
        return new GameActivity(this.currentUser, this.currentGame);
    }

    /**
     * Current Game object getter
     *
     * @returns Promise<Game|null>
     */
    get game(): Promise<Game|null> {
        if (this._game) return Promise.resolve(this._game);

        return (new Game).findById(this.currentGame)
            .then((g:Game) => {
                this._game = g;
                return g;
            })
            .catch(e => Promise.resolve(null))
    }

    /**
     * Current User object getter
     *
     * @returns Promise<User|null>
     */
    get user(): Promise<User|null> {
        if (this._user) return Promise.resolve(this._user);

        return (new User).findById(this.currentUser)
            .then((u:User) => {
                this._user = u;
                return u;
            })
            .catch(e => Promise.resolve(null))
    }

    /**
     * Current Company object getter
     *
     * @returns Promise<User|null>
     */
    get company(): Promise<Company|null> {
        if (this._company) return Promise.resolve(this._company);
        return (new Company(this.ga)).find({user: this.currentUser})
            .then((c:Company) => {
                this._company = c;
                return this._company;
            })
            .catch(e => Promise.resolve(null))
    }

    /**
     * isAdmin getter
     *
     * async check if current user is Administrator
     *
     * @returns {Promise<boolean>}
     */
    get isAdmin():Promise<boolean>
    {
        return this.user.then((u:User) => u && (<any>u).administrator);
    }

    /**
     * Basic responce for action
     *
     * @param req
     * @param res
     * @param promiseAction
     * @private
     */
    protected _processActionCreation(req:any, res:any, promiseAction:Promise<Action>) {
        promiseAction
            .then(() => {
                res.json({success:true});
            })
            .catch((err:any) => {
                Log.log('Internal Server e500:' + err.message, LogLevel.Error);
                res.status(500).send(err);
            });
    }
}

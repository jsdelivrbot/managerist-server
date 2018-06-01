import {User} from '../models/user';
import {BaseGameController} from "./base.game.controller";
import { LogLevel, Log } from '../core/utils/log';

export class UserController extends BaseGameController {

    constructor(app:any) {
        super(app, [
            {
                route: '/current',
                method: 'get',
                handler: 'actionCurrent'
            }
        ]);
    }

    /**
     * TODO:
     *
     * @param req
     * @param res
     * @param next
     */
    actionCurrent = (req: any, res: any, next: any) => {
        if (!this.currentUser)
            return res.status(401).json({error: 'Not logged in'});

        (new User).findById(this.currentUser)
            .then((u:User) => res.json(u.common))
            .catch((err:any) => {
                Log.log('User not found: '+ this.currentUser, LogLevel.Error);
                res.statusCode = 404;
            });
    }
}
import {Game, GameCommon} from "../../models/game";
import {Event} from "../../models/event";
import {Company} from "../../models/company";
import {BaseGameController} from "../base.game.controller";
import {GameManager} from "../../models/game.manager";
import {Managerist} from "../../app";
import {GameFactory, GameSetup} from "../../models/game.factory";



export class GameController extends  BaseGameController {
    constructor(app:any) {
        super(app, [
            {
                route: '/create',
                method: 'post',
                handler: 'actionNew'
            }, {
                route: '/list',
                method: 'get',
                handler: 'actionList'
            }, {
                route: '/load/:id',
                method: 'get',
                handler: 'actionLoad'
            }, {
                route: '/load/:id',
                method: 'get',
                handler: 'actionLoad'
            }, {
                route: '/delete',
                method: 'post',
                handler: 'actionDelete'
            }, {
                route: '/:id',
                method: 'delete',
                handler: 'actionDelete'
            }, {
                route: '/tick',
                method: 'post',
                handler: 'actionTick'
            }, {
                route: '/check',
                method: 'get',
                handler: 'actionCheck'
            }, {
                route: '/history/:id/:date',
                method: 'get',
                handler: 'actionHistory'
            }, {
                route: '/events/:id',
                method: 'get',
                handler: 'actionEvents'
            }, {
                route: '/event/viewed',
                method: 'post',
                handler: 'actionEventViewed'
            }
        ]);
    }

    /**
     * Get not read events
     *
     * @param req
     * @param res
     * @param next
     */
    actionEvents = (req: any, res: any, next: any) => {
        console.log("GET EVVVENTS: ", {
            company: req.params.id,
            viewed: 0
        });
        (new Event(this.ga)).findAll({
            company: req.params.id,
            viewed: 0
        }).then((data:any[]) =>
            res.json(data.map(m => m.common))
        ).catch((e:any) =>
            res.status(500).json({error: 'Failed to fetch events'})
        );
    }

    /**
     *  Get users game lists.
     * @param req
     * @param res
     * @param next
     */
    actionList = (req: any, res: any, next: any) => {
        (new Game)
            .findAll({users: this.currentUser})
            .then((games:Game[]) => {
                res.json(
                    games.map((g:Game) => g.common)
                );
            })
            .catch((e:Error) =>
                res.status(500).json('Failed to create:' + e.toString())
            );
    }

    /**
     *  Create new Game
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    actionNew = (req: any, res: any, next: any) => {
        (new GameFactory)
            .generate(this.currentUser, new GameSetup(req.body))
            .then((game: Game) => {
                res.json({
                    game: game.common,
                    token: game.getToken(this.currentUser)
                });
            })
            .catch((e: Error) =>
                res.status(500).json('Failed to create:' + e.toString())
            );
    }

    /**
     * Load the game
     * @param req
     * @param res
     * @param next
     */
    actionLoad = (req: any, res: any, next: any) => {
        if (!req.params.id)
            return res.status(403).json({error: 'Game Id should be provided.'});
        (new Game)
            .findById(req.params.id)
            .then((game: Game) => {
                console.log({
                    game: game.common,
                    token: game.getToken(this.currentUser)
                });
                res.json({
                    game: game.common,
                    token: game.getToken(this.currentUser)
                });
            })
            .catch((e: Error) =>
                res.status(402).json('Failed to load:' + e.toString())
            );
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    actionDelete = (req: any, res: any, next: any) => {
        let id = req.params.id || req.body.id;
        if (!id)
            return res.status(403).json({error: 'Game Id should be provided.'});

        Managerist.eraseGames([id])
            .then(() => {
                console.log({
                    game: id,
                    result: 'Deleted'
                });
                res.json(true);
            })
            .catch((e: Error) =>
                res.status(402).json('Failed to load:' + e.toString())
            );
    };

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    actionEventViewed = (req: any, res: any, next: any) => {
        if (!req.body.id)
            return res.status(403).json({error: 'Event should be provided.'});

        (new Event(this.ga)).findById(req.body.id)
            .then((e:Event) => e.populate({'viewed': true}).save())
            .then(() => res.json(this._actionResponse([])))
            .catch((e:any) =>
                res.status(500).json({error: 'Failed update event:' + req.params.id})
            );
    };

    /**
     * Get history of certain company starting from the date...
     *
     * @param req
     * @param res
     * @param next
     */
    actionHistory = (req: any, res: any, next: any) => {
        if (!req.params.id)
            return res.status(403).json({error: 'Company should be provided.'});
        let date = req.params.date;

        // Param can be passed as timestamp, in that case should be treated as a number
        date = (new Date(isNaN(+date) ? date : +date)).getTime();

        if (isNaN(date))
            return res.status(403).json({error: 'Valid date should be provided.'});

        (new Event(this.ga)).findAll({
            company: req.params.id,
            date: {$gt:date}
        }).then((data:any[]) =>
            res.json(data.map(m => m.common))
        ).catch((e:any) =>
            res.status(500).json({error: 'Failed to search history'})
        );
    };

    /**
     * Poll server to generate events, etc. | Continuous mode
     *
     * @param req
     * @param res
     * @param next
     */
    actionCheck = (req: any, res: any, next: any) => {
        return this.game.then((arGame:Game) => {
            let game:GameCommon = arGame.common,
                secondsPlaying = ((new Date).getTime() - game.lastInteraction) / 1000,
                dt =  secondsPlaying * 3600000 * game.options.speed; // Each second equivalents to 1 tick

            return this._respondUpdatedEventsToDate(req, res, arGame, dt);
        });
    };

    /**
     * 1tick ~ hour in simulator * speed | Turn based mode
     *
     * @param req
     * @param res
     * @param next
     */
    actionTick = (req: any, res: any, next: any) => {
        return this.game.then((arGame:Game) => {
            let game:GameCommon = arGame.common,
                dt = game.options.speed * 3600; // 1h * game speed
console.log("TICK TICK TICK TICK TICK TICK TICK TICK TICK TICK TICK TICK TICK TICK TICK TICK TICK ");
            return this._respondUpdatedEventsToDate(req, res, arGame, dt);
        });
    };

    /**
     *
     * @param req
     * @param res
     * @param {Game} arGame
     * @param {number} periodSeconds
     * @param {Event[]} eventsToAdd
     * @private
     */
    private _respondUpdatedEventsToDate(req: any, res: any, arGame:Game, periodSeconds: number, eventsToAdd:Event[] = []) {
        let game:GameCommon = arGame.common,
            data:any = {
                companies:[],
                action:'Tick',
                previousDate: game.simulationDate,
                date: new Date(arGame.simulationDate.getTime() + periodSeconds*1000),
                dt: periodSeconds
            },
            now = new Date();

        console.log('trying to generate');
        (new GameManager(arGame)).play(this.ga, periodSeconds)
            .then((events:Event[]) => {
                events = events.concat(eventsToAdd);
console.log('MANAGER PLAYED ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ' + periodSeconds + ' s');
                return (new Company(this.ga)).getCurrent()
                    .then((c:any[]) => {
                        c = c.map((_c:any) => ''+_c._id);
                        data.events =
                            events
                                .filter((_e: any) => c.indexOf(''+_e.company) != -1)
                                .map((e:Event) => e.common);
                        res.json(data);
                    });
            })
            .catch((e:Error) => {
                console.log('Something goes wrong in Game/tick', e);
                res.status(500).json({error:'Something goes wrong in Game/tick'});
            });
    }

    private _actionResponse = (events:Event[]) => ({success: true, events});
}

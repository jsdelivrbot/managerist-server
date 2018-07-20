import {Game, GameCommon} from "../../models/game";
import {Event} from "../../models/event";
import {Company} from "../../models/company";
import {BaseGameController} from "../base.game.controller";
import {GameManager} from "../../models/game.manager";
import {Managerist} from "../../app";
import {GameFactory, GameSetup} from "../../models/game.factory";
import { Log, LogLevel } from "../../core/utils/log";
import { Technology } from "../../models/technology";
import { BaseController } from "../../core/base.controller";
import { Department } from "../../models/department";
import { ActionType } from "../../models/actions/action.type";
import { AlertType } from "../../models/alerts";
import { EventType } from "../../models/event.type";
import { Role } from "../../models/role";
import { Feature } from "../../models/feature";
import { runInThisContext } from "vm";



export class DictController extends BaseGameController {
    constructor(app:any) {
        super(app, [
            {
                route: '/department',
                method: 'get',
                handler: 'actionDepartment'
            },
            {
                route: '/actiontype',
                method: 'get',
                handler: 'actionActionType'
            },
            {
                route: '/alerttype',
                method: 'get',
                handler: 'actionAlertType'
            },
            {
                route: '/eventtype',
                method: 'get',
                handler: 'actionEventType'
            },
            {
                route: '/role',
                method: 'get',
                handler: 'actionRole'
            },
            {
                route: '/technology',
                method: 'get',
                handler: 'actionTechnology'
            },
            {
                route: '/feature',
                method: 'get',
                handler: 'actionFeature'
            },
        ]);
    }

    /**
     * Get departments
     *
     * @param req
     * @param res
     * @param next
     */
    actionDepartment = (req: any, res: any, next: any) => {
        (new Department()).findAll()
            .then((data:any[]) =>
                res.json(data.map(m => m.common))
            );
    }

    /**
     * Get departments
     *
     * @param req
     * @param res
     * @param next
     */
    actionFeature = (req: any, res: any, next: any) => {
        if (!this._currentGame)
            return  res.status(403).json({error: "Game not loaded."});

        (new Feature(this.ga)).findAll()
            .then((data:any[]) =>
                res.json(data.map(m => m.common))
            );
    }


    /**
     * Get action types
     *
     * @param req
     * @param res
     * @param next
     */
    actionActionType = (req: any, res: any, next: any) => {
        (new ActionType()).findAll()
            .then((data:any[]) =>
                res.json(data.map(m => m.common))
            );
    }

    /**
     * Get alert type
     *
     * @param req
     * @param res
     * @param next
     */
    actionAlertType = (req: any, res: any, next: any) => {
        (new AlertType()).findAll()
            .then((data:any[]) =>
                res.json(data.map(m => m.common))
            );
    }

    /**
     * Get event type
     *
     * @param req
     * @param res
     * @param next
     */
    actionEventType = (req: any, res: any, next: any) => {
        (new EventType()).findAll()
            .then((data:any[]) =>
                res.json(data.map(m => m.common))
            );
    }

    /**
     * Get roles
     *
     * @param req
     * @param res
     * @param next
     */
    actionRole = (req: any, res: any, next: any) => {
        (new Role()).findAll()
            .then((data:any[]) =>
                res.json(data.map(m => m.common))
            );
    }

    /**
     * Get technologies
     *
     * @param req
     * @param res
     * @param next
     */
    actionTechnology = (req: any, res: any, next: any) => {
        (new Technology()).findAll()
            .then((data:any[]) =>
                res.json(data.map(m => m.common))
            );
    }
}

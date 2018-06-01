import * as express from 'express';
import {Model} from "mongoose";
import {Mean} from "../core/mean";
import {UserIdentity} from "../models/user.identity";
import { Log, LogLevel } from './utils/log';

export abstract class BaseController {
    baseModel: Model<any>;
    baseRoute: string;

    private _app:any;
    protected _errStatusCode:number;

    /**
     * Hook for preprocessing request, maybe used for
     * permission check, authentication, other
     *
     * @param req
     * @return {boolean}
     */
    protected requestCheck(req:any) {
        // Example
        req.session.history = req.session.history || [];
        req.session.history.push(req.get('Referrer'));
        if (req.session.history.length > Mean.app.MAX_HISTORY)
            req.session.history.unshift();

        return true;
    };

    /**
     *
     * @param app ~ express.Application
     * @param routes
     */
    constructor(app: any, routes?: {route:string, method:string, handler:string}[]) {
        this._app = app;
        Log.log('Controller registered: ' + ((this.constructor ? this.constructor.name : 0) || '<unknown>'), LogLevel.Debug, {color:'green'});
        this.baseRoute = this.constructor.name.replace('Controller', '').replace(/([A-Z])/g, "/$1").toLowerCase();

        Log.log('\taction: '
            + this.constructor.name + '->'
            + this.constructor.name.replace('Controller', '') + '->'
            + this.constructor.name.replace('Controller', '').replace(/([A-Z])/g, "/$1") + '->'
            + '\u001B[36m constructor ' + this.baseRoute  + '\u001B[0m',
        LogLevel.Debug, {color:'yellow'});

        /**
         * Apply passed routes
         *
         */
        if (routes && routes.length) {
            for (let r of routes) {
                Log.log('\t\tapply:' + r.route, LogLevel.Debug, {color:'cyan'});
                app[r.method](this.baseRoute + r.route, this._prepareAction(r.handler))
            }
        }
    }

    protected _addHandler(method:string, uri:string, handler:string) {
        this._app[method](uri, this._prepareAction(handler));
    }

    private _prepareAction(a:string):any {
        return (req: any, res: any, next: any) => {
            Log.log("REQUESTED: " +  req.url, LogLevel.Debug, {color:'blue'});
            try {
                if (!this.requestCheck(req))
                    return res.status(this._errStatusCode || 403).json('Request forbidden.');

                let handler = !!(<any>this)[a]
                    ? (<any>this)[a](req, res, next)
                    : () => {};

                return handler;
            } catch(e){
                Log.log('Critical error RES(500).' + e.message, LogLevel.Error);
                res.status(500).json({error: 'Critical error, please contact administration.'});
            }
        }
    }
}
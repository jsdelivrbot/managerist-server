import * as http from 'http';
import * as express from 'express';
import * as expressSession from 'express-session';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as services from '../controllers/index';

import {Cache} from './db/redis';
import {Db} from './db/mongo';
import passport = require("passport");
import { Log, LogLevel } from './utils/log';

export class Mean {
    protected _MAX_HISTORY:number = 10;
    get MAX_HISTORY():number {
        return this._MAX_HISTORY;
    }

    private _ready: boolean = false;
    private _onReady: ()=>{};
    get isReady() {
        return this._ready;
    };

    private _app:any;
    private _server:http.Server;
    get server() {
        return this._server;
    }
    private _port:number;
    get port() {
        return this._port;
    }



    private _config:any;
    private _db: Db;
    private _cache: Cache;

    // Maintain a hash of all connected sockets
    private _sockets: any[] = [];
    private _nextSocketId = 0;

    private static _instance: Mean;

    static get config():any {
        return Mean._instance ? Mean._instance._config : {};
    }
    static get db():Db {
        return Mean._instance ? Mean._instance._db : null;
    }
    static get cache():Cache { return Mean._instance._cache;}

    static get app():Mean {return Mean._instance;}

    static create(port: number, config: any) {

        return Mean._instance || new (<any>this.constructor(port, config));
    }

    constructor(port:number, config:any) {
        if (Mean._instance) {
            Log.log('Server already run on port: ' + Mean._instance._port + ' ~ aka ~ ' + this.constructor.name, LogLevel.Error);
            return Mean._instance;
        }
        Mean._instance = this;
        this.init(port, config)
            .then(() => this._ready = true)
            .then(() => this._onReady && this._onReady());
    }

    protected generateSessionId() {
        return 'comeup_smthng_in_child';
    }

    protected init(port: number, config: any): Promise<any> {
        this._config = config;
        this._app = this._app || express();
        this._app.use(bodyParser.urlencoded({extended: false}));
        this._app.use(bodyParser.json());
        this._app.use(bodyParser.text());
        this._app.use(cookieParser());
        this._app.use(compression());
        this._app.use(expressSession({
            secret: this._config.security.sessionSalt,
            resave: true,
            saveUninitialized: true
        }));
        this._app.use(passport.initialize());
        this._app.use(passport.session());

        // Init Cache
        if (config.cache)
            this._cache = new Cache(config.cache);
        // Init Db
        this._db = new Db(config.db);

        this._app.all("/*", function (req: any, res: any, next: any) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With, content-type, Authorization");
            res.header("Access-Control-Allow-Methods", "GET,HEAD,POST,DELETE,OPTIONS");
            next();
        });
        services.init(this._app);

        /**
         * Server with gzip compression.
         */
        return this._db.init()
        .then(res => {
            if (!res) throw new Error('DB Connections failed to instantiate.');
        })
        .then(() => 
            new Promise<http.Server>((resolve, reject) => {
                this._server = this._app.listen(port, () => {
                    this._port = (<any>this._server.address()).port;
                    Log.log('App is listening on port: ' + port, LogLevel.Debug);
                });
                this._server.on('connection', (socket: any) => {
                    // Add a newly connected socket
                    var socketId: any = this._nextSocketId++;
                    this._sockets[socketId] = socket;
                    //Log.log('socket ' +  socketId + ' opened', LogLevel.Debug);
                    // Remove the socket when it closes
                    socket.on('close', () => {
                        //Log.log('socket ' + socketId + ' closed', LogLevel.Debug);
                        delete this._sockets[socketId];
                    });
                });
                return resolve(this._server);
            })
        ).catch((e) => {
            Log.log(e.message, LogLevel.Error);

            if (e.syscall !== 'listen') {
                throw e;
            }

            var bind = typeof port === 'string'
                ? 'Pipe ' + port
                : 'Port ' + port;

            // handle specific listen errors with friendly messages
            switch (e.code) {
                case 'EACCES':
                    Log.log(bind + ' requires elevated privileges', LogLevel.Error);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    Log.log(bind + ' is already in use', LogLevel.Error);
                    process.exit(1);
                    break;
                default:
                    throw e;
            }
        });
    }

    /**
     *  Stop & Cleanup
     * @param cb
     */
    stop(cb?:Function)
    {
        for (var socketId in this._sockets) {
            Log.log('socket ' +  socketId + ' destroyed.', LogLevel.Debug);
            this._sockets[socketId].destroy();
        }
        this._server.close(cb);
        let ttl = 15000,
            shutdown = () => {
                if (this._ready || ttl <= 0) process.exit(1);
                ttl-=500;
                setTimeout(shutdown, 500);
            };
        shutdown();
        Mean._instance = undefined;
    }
}
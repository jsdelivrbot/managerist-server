import * as mongoose from 'mongoose';
import { Log, LogLevel } from '../utils/log';
import { ConnectionManager } from './connection.manager';

export class Db {
    private _config: any = {};
    private _connections: {[key:string]:mongoose.Connection} = {};
    private _defaultConnection: string;

    get default() {
        return this._connections[this._defaultConnection];
    }

    get connections() {
        return this._connections || {};
    }

    addConnection(conn: any): Promise<boolean> {
        conn.host = conn.host || this._config.host;
        //dbName: string, host:string = 'localhost'
        if (!conn || !conn.name || !conn.host || !conn.db) {
            Log.log((conn ? conn.name : 'Unknown connection') + ' ~ lack of params (host|name|db)', LogLevel.Error);
            Log.log(conn, LogLevel.Debug, {color:'cyan'});
            return Promise.resolve(false);
        }

        // connection already exists
        // TODO: maybe check if connection have same host/db params as existing
        if (this._connections[conn.name]) {
            Log.log('Connection ' + conn.name + ' on '+ conn.host + '/' + conn.db + ' already exists', LogLevel.Warning);
            return Promise.resolve(true);
        }

        try {
            let dbUser = conn.user || this._config.user,
                dbPass = conn.password || this._config.password;
            this._connections[conn.name] = mongoose.createConnection(
                'mongodb://' + conn.host + '/' + conn.db,
                dbUser
                    ? {
                        user: dbUser,
                        pass: dbPass
                    }
                    : {}
            )
            if (conn.default || !this._defaultConnection)
                this._defaultConnection = conn.name;
            Log.log('Connected to the: mongodb://' + conn.host + '/' + conn.db, LogLevel.Debug, {color:'purple'});
            Log.log(conn, LogLevel.Debug, {color:'cyan'});
            Log.log(dbUser
                ? {
                    user: dbUser,
                    pass: dbPass
                }
                : {}, LogLevel.Debug, {color:'green'});
            if (conn.seed) {
                Log.log('Have a seed for connection: ' + conn.name + ' (dir:' + conn.seed + ')', LogLevel.Debug, {color:'purple'});
                return (new ConnectionManager(this._connections[conn.name]))
                    .importJSONs(conn.seed)
            }
        } catch(err) {
            Log.log(err.message, LogLevel.Error);
            return Promise.resolve(false);
        }
        return Promise.resolve(true);
    }

    removeConnection(connName:string) {
        if (!this._connections[connName])
            return;

        this._connections[connName].close();
        delete this._connections[connName];
    }

    constructor(config:any) {
        (mongoose as any).Promise = global.Promise;
        this._config = config;

        return this;
    }

    public init(): Promise<boolean> {
        Log.log('Have a ' + this._config.connections.length + ' DB connections', LogLevel.Debug, {color:'purple'});
        return Promise.all(
            this._config.connections.map(conn => this.addConnection(conn))
        )
        .then((oks:any[]) => {
            Log.log(oks, LogLevel.Debug, {color:'cyan'});
            return !(oks.filter(ok => !ok).length)
        });
    }
}

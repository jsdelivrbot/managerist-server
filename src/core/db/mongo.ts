import * as mongoose from 'mongoose';

export class Db {
    private _config: any = {};
    private _connections: any = {};
    private _defaultConnection: string;

    get default() {
        return this._connections[this._defaultConnection];
    }

    get connections() {
        return this._connections || {};
    }

    addConnection(conn: any):boolean {
        conn.host = conn.host || this._config.host;
        //dbName: string, host:string = 'localhost'
        if (!conn || !conn.name || !conn.host || !conn.db) {
            console.error('\u001B[31m' + (conn ? conn.name : 'Unknown connection') + ' ~ lack of params (host|name|db)' + '\u001B[0m');
            return false;
        }

        // connection already exists
        // TODO: maybe check if connection have same host/db params as existing
        if (this._connections[conn.name])
            return true;

        try {
            this._connections[conn.name] = mongoose.createConnection('mongodb://' + conn.host + '/' + conn.db, {})
            if (conn.default || !this._defaultConnection)
                this._defaultConnection = conn.name;
            console.log('Connected to the: mongodb://' + conn.host + '/' + conn.db);
        } catch(err) {
            console.log(err.message);
            return false;
        }
        return true;
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

        for(let conn of config.connections)
            this.addConnection(conn);

        return this;
    }
}

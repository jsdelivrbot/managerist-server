import { Connection } from "mongoose";
import * as fs from "fs"
import { Log, LogLevel } from "../utils/log";
import { ObjectID, BSON } from "bson";

export class ConnectionManager {
    constructor(protected _connection:Connection) {}
    
    importJSONs(path:string): Promise<boolean> {
        return (new Promise((resolve, reject) => {
            fs.readdir(path, (err, filelist) => {
                if (err) reject(err);
                return resolve(filelist);
            })
        }))
        .then((filelist:string[]) => {
            let cname = (fname) => fname.replace('.json', '');
            return Promise.all(
            filelist
            .filter(fnm => fnm.indexOf('.json') !== -1)
            .map(
                filename => 
                (new Promise((resolve) => this._connection.dropCollection(cname(filename), resolve)))
                .then(() => new Promise((resolve) => this._connection.createCollection(cname(filename), {}, (err) => resolve(!err))))
                .then(() => new Promise(resolve => fs.readFile(path + '/' + filename, 'utf-8', (err, fdata: string) => resolve(fdata))))
                .then((fdata:string) => {
                    this._connection.collection(cname(filename)).insertMany(
                        fdata.split('\n').filter(d => !!d).map(row => {
                            let prow = row.replace(/\{"\$oid":"([^"]*)"\}/g, '"$1"'),
                                pdata = JSON.parse(prow);
                            pdata._id = new ObjectID(pdata._id);
                            return pdata;
                        })
                    )
                })
            )
        )})
        .then(() => true)        
    }
}
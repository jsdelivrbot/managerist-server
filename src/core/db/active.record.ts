import {Schema, Model, Types as MongoTypes} from "mongoose";
import {isNumber} from "util";
import {Mean} from "../mean";
import {Mongable} from "./mongable";
import { Log, LogLevel } from "../utils/log";

export var SchemaTypes = Schema.Types;
export {Types as MongoTypes} from "mongoose";

export interface ActiveRecordInterface {
    new (data?:any) : ActiveRecord;
}
export enum ActiveRecordRulesTypes {BELONGS, HAS_ONE, HAS_MANY, ENUM, CUSTOM};
export interface ActiveRecordRule {
    type:ActiveRecordRulesTypes;
    related:any;
    external?:boolean;
    nullify?:boolean;
}
export abstract class ActiveRecord {
    protected _model: Model<any>;

    protected abstract _common: any;

    protected _name: any = '';
    protected _connection: string = '';
    protected _dbRef: any;
    protected _schema: any = {};
    protected relations: any[] = [];
    protected _sort = {};

    protected _with:string = '';
    private _withArr:string[] = [];

    protected get mongoWith() {
        return this._with;
    }

    protected get withArr() {
        return this._withArr;
    }

    _id: any;
    public get rules():{[key:string]:ActiveRecordRule} {return {};}

    get connection() {
        return this._connection || 'main';
    }

    set connection(conn:string) {
        if (this._model && this._dbRef) {
            delete this._dbRef.models[this.constructor.name];
            delete this._dbRef.collections[this._model.collection.collectionName];
            delete this._dbRef.base.modelSchemas[this.constructor.name];
            this._model = null;
        }
        this._connection = conn;
    }

    constructor(data?:any, connection?:any) {
        if (connection)
            this._connection = connection;
        return data ? this.populate(data, true) : this;
    }

    get model() {
        if (this._model)
            return this._model;
        let name:string = this._name || this.constructor.name,
            conn:any = this.connection
                ? Mean.db.connections[this.connection]
                : Mean.db.default;

        try {
            this._model = conn.models[name] || conn.model(
                    name,
                    new Schema(Mongable.monga(new this._common, this._schema))
                );
        } catch (e) {
            Log.log('Something wrong (Model)' + this.constructor.name + ' failed to create.', LogLevel.Error);
            Log.log(e, LogLevel.Error);
        }
        this._dbRef = conn;
        return this._model;
    }

    /**
     * Interfacte to receive all public properties, declared in Common
     *
     * @returns {any}
     */
    get common():any {
        return this.filterProperties(
            Object.getOwnPropertyNames(new this._common).concat('_id')
        );
    }

    protected get attributes():any {
        return this.filterProperties(this.fieldsList);
    }

    protected filterProperties(props:any) {
        let common = new this._common;
        for(let prop of props) {
            if ((<any>this)[prop] !== undefined)
                common[prop] = (<any>this)[prop];

            // TODO: move to relations
            if (typeof common[prop] == 'object' && common[prop] !== {} && !(<any>this)[prop] && !this.rules[prop]) {
                common[prop] = null;
            }
            if (this.rules[prop]) {
                if (!(<any>this)[prop] || ((''+(<any>this)[prop]).indexOf('[') != -1 && !(<any>this)[prop]._id)) {
                    common[prop] = null;
                }

                if (this.rules[prop].type == ActiveRecordRulesTypes.BELONGS)
                    common[prop] = ((<any>this)[prop] && (<any>this)[prop]._id) || (<any>this)[prop];
            }

            let val = this.getFieldValue(prop, common[prop]);
            if (val !== undefined)
                common[prop] = val;
        }

        return common;
    }

    public getFieldValue(prop:string, curr:any) {
        let val:any;
        if (this.rules[prop]) {
            switch(this.rules[prop].type) {
                case ActiveRecordRulesTypes.ENUM:
                    val = Number.isNaN(+curr) ? curr : this.rules[prop].related[+curr];
                    break;
                case ActiveRecordRulesTypes.CUSTOM:
                    val = {};
                    for(let cprop of Object.getOwnPropertyNames(this.rules[prop].related))
                        val[cprop] = this.rules[prop].related[cprop];
                    break;
                default:
                    val = curr;
            }
        } else
            val = curr;
        return val;
    }

    protected _prepareCond(cond:any) {
        cond = cond || {};

        let pcond:any = cond,// {},  // TODO: cameup with Filtering and SANITIZE
            common = new this._common;

        // Assuming that all non-determiated types are links to the other
        for(let prop of Object.getOwnPropertyNames(common).concat('_id')) {
            if (cond[prop] === undefined) continue;

            if (prop == '_id' || ['Number', 'Boolean', 'String', 'Array', 'Function'].indexOf(common[prop].constructor.name) == -1) {
                if (cond[prop] &&  (''+cond[prop]).match(/^[0-9abcdef]*$/)) {
                    if (cond[prop].map)
                        pcond[prop] = cond[prop].map(MongoTypes.ObjectId);
                    else
                        pcond[prop] = MongoTypes.ObjectId(cond[prop]);
                } else
                    pcond[prop] = typeof cond[prop] == 'object' ? cond[prop] : null;
            }
            else
                pcond[prop] = cond[prop];
        }

        return pcond;
    }

    sort(obj:any){
        this._sort = obj;
        return this;
    }

    withRelations(obj:string[]) {
        this._withArr = obj;
        let mongoFetchable = [];
        for (let rel of (obj || []))
            if (!this.rules[rel] || !this.rules[rel].external)
                mongoFetchable.push(rel);
        this._with = mongoFetchable.join(' ');

        return this;
    }

    /**
     * findById
     *
     * retrieve element by id, or throw error
     *
     * @param id
     * @param populate
     * @returns Promise<ActiveRecord>
     */
    findById(id:any, populate: boolean = true):Promise<ActiveRecord> {
        return this.find({_id: MongoTypes.ObjectId(id)}, populate).then(
            (ar:ActiveRecord|any) => {
                if (!ar || !ar._id)
                    throw new Error('Record (_id: ' + id + ' ) of ' + this.constructor.name + ' not found.');
                return ar;
            });
    }

    /**
     * find
     *
     * find one element by condition
     *
     * @param cond
     * @param populate
     * @returns Promise<ActiveRecord|null>
     */
    find(cond:any = {}, populate: boolean = true): Promise<ActiveRecord|null> {
        let p = new Promise<ActiveRecord|null>((resolve, reject) =>
            this.model.find(this._prepareCond(cond))
                .sort(this._sort)
                .limit(1)
//                .populate(this.mongoWith)
                .exec((err: Error, data: any) => {
                    if (err)
                        return reject('Failed to search');

                    let cnstr: any = this.constructor;
                    return resolve(data && data.length ? (new cnstr).withRelations(this.withArr).populate(data[0]) : null);
                })
        );

        if (!populate)
            return p;

        return p.then((d:any) => d ? this.populate(d).populateRelations() : null);
    }

    /**
     * Transform Mongoose model to AR
     * 
     * @param cnstr AR constructor
     * @param data 
     */
    protected _mongoToAr(cnstr: {new(...any):ActiveRecord}, data:any): ActiveRecord {
        return new cnstr(data.toObject());
    }

    /**
     * findAll
     *
     * search with condition clause filtered&prepared by @see(ActiveRecord::_prepareCond)
     *
     * @param cond
     * @returns {any}
     */
    findAll(cond?:any): Promise<ActiveRecord[]> {
        return new Promise((resolve, reject) =>
            this.model.find(this._prepareCond(cond))
                .sort(this._sort)
                .populate(this.mongoWith)
                .exec((err: Error, data: any) => {
                    if (err) return reject('Failed to search');
                    let cnstr: any = this.constructor;

                    return resolve((data || []).map((d: any) => {
                        let ar = (new cnstr).populate(d);
                        /**
                         *  Convert Mongoose-model doc to ARs (if mentioned in relations)
                         **/
                        for (let rel of this.mongoWith.split(' ')) {
                            if (!d[rel] || !this.rules[rel] || this.rules[rel].external) continue;

                            if (typeof (<any>d[rel]).map == "function") {
                                ar[rel] = d[rel].map(_d => this._mongoToAr(this.rules[rel].related, _d));
                            } else {
                                ar[rel] = this._mongoToAr(this.rules[rel].related, d[rel]);
                            }
                        }
                        return ar.withRelations(this.withArr);
                    }));
                })
        )
        .then((ar:ActiveRecord[]) =>
            Promise.all(
                ar.map((_ar) => _ar.populateRelations())
            )
        );
    }

    /**
     * save
     *
     * aggregator for create/update, store current state into DB
     *
     * @returns {Promise<ActiveRecord>}
     */
    save():Promise<ActiveRecord> {
        if (this._id)
            return this._update(this.common);
        return this._create(this.common);
    }

    /**
     * update
     *
     * update record
     *
     * @param data
     * @returns {Promise<ActiveRecord>}
     */
    protected _update(data: any): Promise<ActiveRecord> {
        return this.populate(data)
            ._beforeSave()
            .then((res:any) => {
                if (!res) Promise.reject('Before save operation failed for ' + this.constructor.name);
                if (!this._id) return Promise.reject('_id field is empty');

                let dataToPost = this.attributes;
                // MongoDB error ~ trying to update ID (readonly field)
                if (dataToPost._id) delete(dataToPost._id);

                return new Promise((resolve, reject) => {
                    this.model.update(this._prepareCond({_id: this._id}), dataToPost, (err, dbres) => {
                        return err ? reject(err) : resolve(true);
                    });
                });
            })
            .then(() => this)
            .catch((e:Error) => {
                Log.log('AR ('+this.constructor.name+') Update failed: ' + e.toString(), LogLevel.Error);
                throw new Error('AR ('+this.constructor.name+') Update failed: ' + e.toString());
            });
    }

    /**
     * create
     *
     * create record
     *
     * @param data
     * @returns {Promise<ActiveRecord>}
     */
    protected _create(data: any = {}): Promise<ActiveRecord> {
        return this.populate(data)
            ._beforeSave()
            .then((res:any) => {
                return res
                    ? new Promise((resolve, reject) =>
                            this.model.create(this.attributes, (err:any, dbres: {_id: any}) => {
                                if (err || !dbres._id)
                                    return reject('Failed to Create: ' + err);
                                this.populate(dbres);
                                return resolve(dbres._id);
                            })
                        )
                    : Promise.reject('Before save operation failed for ' + this.constructor.name);
            })
            .then(() => this)
            .catch((e:Error) => Promise.reject('AR Create failed: ' + e.toString()));
    }

    count(cond:any): Promise<number> {
        return new Promise((resolve, reject) =>
            this.model.count(this._prepareCond(cond))
                .exec((err:any, res:any) => !err ? resolve(res) : reject(err))
        );
    }

    delete(cond?:any): Promise<boolean> {
        cond = cond || {_id: this._id};

        return new Promise((resolve, reject) =>
            this.model.remove(this._prepareCond(cond))
                .exec((err:any, res:any) => resolve(!err))
        );
    }

    /**
     * populate
     *
     * fill ActiveRecord with data, by default properties filtered by those that may exists on AR @see fieldsList
     *
     * @param data
     * @param force
     * @returns {ActiveRecord}
     */
    populate(data:any = {}, force:boolean = false):ActiveRecord {
        let fields = force ? Object.getOwnPropertyNames(data) : this.fieldsList;
        for(let prop of fields)
            if (data[prop] !== undefined)
               (<any>this)[prop] = this.getFieldValue(prop, data[prop]);

        return this;
    }

    /**
     *
     * @param rels
     * @returns {Promise<ActiveRecord>}
     */
    populateRelations(rels:string[] = []): Promise<ActiveRecord> {
        // TODO ~ sohuld check AR rules, if it's set as relation, and there is another AR class, -> fetch it if it's not fetched yet
        return Promise.resolve(this);
    }


    /**
     * getter fieldsList
     *
     * returns properties that exists in _common, _schema + _id (if it was not exists in common)
     *
     * @returns {string[]}
     */
    protected get fieldsList()
    {
        let obj = this._common ? new (<any>this)._common : {};

        return Object.getOwnPropertyNames(obj)
            .concat('_id')
            .concat(...Object.getOwnPropertyNames(this._schema));
    }

    protected _beforeSave():Promise<boolean> {
         return new Promise((resolve) => resolve(true));
    }

    public static ID(param) {
        return param = MongoTypes.ObjectId(param);
    }
}
/**
 *
 */
export class ActiveRecordError extends Error {}

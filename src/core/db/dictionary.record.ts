import {ActiveRecord, ActiveRecordError} from "./active.record";

/**
 * Class DictionaryRecord
 *
 * @property name string
 */
export abstract class DictionaryRecord extends ActiveRecord {
    protected static _loaded: DictionaryRecord[] = [];
    protected static _preloading:boolean = false;
    protected static _preloaded:boolean = false;
    protected static _nameField:string = 'name';

    /**
     * dictionary should not be empty
     *
     * @returns {boolean}
     */
    public static get isLoaded() {
        return !!this._loaded.length && !this._preloading;
    }

    public static preload(force:boolean = false) : Promise<DictionaryRecord[]> {
        if (!force && this._loaded.length)
            return Promise.resolve(this._loaded);
        this._preloading = true;
        return (new (<any>this)).findAll()
            .then((res:any[]) => {
                console.log(this.name + ' loaded ~ ' + res.length);
                this._loaded = res;
                this._preloading = false;
                this._preloaded = true;
                return this._loaded;
            });
    }

    /**
     * @param name
     * @param nameField
     * @returns {any}
     */
    public static getByName(name:string, nameField:string = null):DictionaryRecord {
        nameField = nameField || this._nameField;
        name = name.toString();
        let thisClass:any = this;
        if (!thisClass._loaded.length)
            throw new ActiveRecordError('No ' + thisClass.name +' loaded');
        let dat:any = thisClass._loaded.find((dr:DictionaryRecord) => {
            return (<any>dr)[nameField].toString().replace(/\s/g, '') == name;
        });
        if (!dat)
            throw new ActiveRecordError('No ' + thisClass.name +' with name|_id ~ ' + name);
        return dat;
    }

    /**
     *
     * @param name
     * @returns {DictionaryRecord}
     */
    public static getById(name:string):DictionaryRecord {
        return this.getByName(name, '_id');
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
        let thisClass:any = this.constructor,
            search = () => thisClass._loaded.find((_i:any) => (''+_i._id) == (''+id));

        if (thisClass._preloaded)
            return Promise.resolve(search());
        return thisClass.preload(true)
            .then(search);
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
    find(cond:any, populate: boolean = true): Promise<ActiveRecord|null> {
        let thisClass:any = this.constructor,
            search = () => thisClass._loaded.find((_i:any) => {
                for(let p of Object.getOwnPropertyNames(cond)) {
                    if ('' + cond[p] != '' + _i[p])
                        return false;
                }
                return true;
            });
        if (thisClass._preloaded)
            return Promise.resolve(search());
        return thisClass.preload(true)
            .then(search);
    }

    /**
     *
     * @param cond
     * @return {any[]}
     */
    search(cond?:any):any[] {
        let thisClass:any = this.constructor;

        let res:any[] = thisClass._loaded.filter((_i:any) => {
            for(let p of Object.getOwnPropertyNames(cond)) {
                if (cond[p].includes) {
                    return (cond[p].includes(_i[p]) || cond[p].includes(_i[p].toString()));
                } else if (cond[p].toString() != (_i[p] || '').toString())
                    return false;
            }
            return true;
        });
        return res;
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
        let thisClass:any = this.constructor;

        if (thisClass._preloaded)
            return Promise.resolve(cond ? this.search(cond) : thisClass._loaded);

        return super.findAll(cond);
    }
}

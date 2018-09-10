import {Role as RoleCommon} from "../common/models/role"
export {Role as RoleCommon} from "../common/models/role"

import {ActiveRecord, SchemaTypes, ActiveRecordError, ActiveRecordRule, ActiveRecordRulesTypes} from "../core/db/active.record";
import {DictionaryRecord} from "../core/db/dictionary.record";
import {Character, BasicProperty} from "./character";
import {Department} from "./department";
import {KnowledgeBranch, Technology, ExpertiseLevel} from "./technology";

/**
 * Class Role
 *
 * @property name string
 */
export class Role extends DictionaryRecord {
    // common
    department: Department|any = new Department;
    name:string = '';
    trait:any;
    minLevel:ExpertiseLevel;

    protected static _loaded: Role[] = [];
    protected static _preloading:boolean = false;

    protected _common: any = RoleCommon;
    protected _schema: any = {
        minLevel: String,        
        trait: SchemaTypes.Mixed
    };

    public get rules(): { [key: string]: ActiveRecordRule } {
        return {
            'minLevel': {type: ActiveRecordRulesTypes.ENUM, related: ExpertiseLevel}
        };
    }
    
    /**
     * Overriden to get a branches
     *
     * @param cond
     * @returns {any}
     */
    findAll(cond?:any): Promise<Role[]> {
        this.withRelations(['department']);
        return <Promise<Role[]>>super.findAll(cond);
    }


    /**
     *  getter character
     *
     *  Create BasicParams settings suitable for particular role
     *  with low-mid level
     *
     * @returns {Character}
     */
    public get character() {
        let b:Character = new Character;
        for (let param of Object.getOwnPropertyNames(((<any>this).trait || {}).character || {}))
            (<any>b)[param] = (<any>this).trait.character[param];
        let n = (((<any>this).trait || {}).n || Character.defaultN) - b.n;

        return b.updateRandom(n);
    }

    /**
     *  getter branch
     *
     *  Create BasicParams settings suitable for particular role
     *  with low-mid level
     *
     * @returns {KnowledgeBranch}
     */
    public get branch(): KnowledgeBranch {
        if (!this.department)
            throw new ActiveRecordError('No department for role: ' + this.name);
        return Technology.getKnownBranch(this.department.branch._id || this.department.branch);
    }

}

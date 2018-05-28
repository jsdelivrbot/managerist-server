import {Department as DepartmentCommon} from '../common/models/department';
export {Department as DepartmentCommon} from '../common/models/department';

import {SchemaTypes, ActiveRecordError} from "../core/db/active.record";
import {Company} from "./company";
import {U} from "../common/u";
import {DictionaryRecord} from "../core/db/dictionary.record";
import {Technology} from "./technology/technology";

export enum KnownDepartments {Finance, Marketing, Production, HR}

/**
 * Class Department
 * @todo extend from DictionaryRecord
 */
export class Department extends DictionaryRecord {
    protected _connection: string = 'main';
    protected _common: any = DepartmentCommon;

    //common
    name:string;
    branch: Technology;
    protected _schema: any = {
        branch: SchemaTypes.ObjectId,
    };

    /**
     * @param d
     * @returns {Promise<Department>}
     */
    public static getKnown(d:KnownDepartments|string|any):Department {
        if (!Department._loaded.length)
            throw new ActiveRecordError('No Department loaded');

        let nm:string|any = U.e(KnownDepartments, d) || d;
        return <Department>Department._loaded.find((_d: any) => _d.name == nm || ('' + _d._id) == nm);
    }
}

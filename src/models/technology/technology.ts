import {
    Technology as TechnologyCommon, KnowledgeBranch, TechnologyExpertise as TechnologyExpertiseCommon,
    ExpertiseLevel
} from '../../common/models/technology';

import {ActiveRecordError, SchemaTypes} from "../../core/db/active.record";
import {isNumber} from "util";
import {Role} from "../role";
import {U} from "../../common/u";

export {
    Technology as TechnologyCommon, KnowledgeBranch, TechnologyExpertise as TechnologyExpertiseCommon, ExpertiseLevel,
    TechnologyUsage
} from '../../common/models/technology';
export enum KnownBranch{Programming, Finance, Marketing, Organizing, Electronics};



import {Types as MongoTypes} from "mongoose";
import {DictionaryRecord} from "../../core/db/dictionary.record";
import {TechnologyExpertise} from "./technology.expertise";

/**
 * Class Technology
 *
 */
export class Technology extends DictionaryRecord {
    // common
    name: string;
    salary: number; // median salary for technology / for Mid-level specialist
    volume: number;
    complexity: number;

    // Refs
    parent: Technology; // KnowledgeBranch or another tech;

    private static _defaultSalary: number = 1000;
    private static _branches: KnowledgeBranch[] = [];
    protected _common: any = TechnologyCommon;
    protected _schema: any = {
        parent: SchemaTypes.ObjectId
    }

    static get defaultSalary() {
        return Technology._defaultSalary;
    }

    static get branches(): KnowledgeBranch[] {
        if (!Technology._branches.length)
            throw new ActiveRecordError('Technologies not loaded');
        return this._branches;
    }

    /**
     * Overriden to get a branches
     *
     * @param force
     * @returns {any}
     */
    public static preload(force:boolean = false) : Promise<DictionaryRecord[]> {
        return DictionaryRecord.preload.apply(this)
            .then(() => {
                this._branches = (<any[]>this._loaded.filter((t:Technology) => !t.parent));
                return this._loaded;
            })
    }

    /**
     *
     * @param b
     * @return {KnowledgeBranch}
     */
    public static getKnownBranch(b:KnownBranch):KnowledgeBranch {
        let nm:string = U.e(KnownBranch, b);
        return Technology.branches.find((b:KnowledgeBranch) => b.name == nm || (''+b._id) == nm);
    }

    /**
     * getForRole
     *
     * generates Expertize based on overall Employees level
     *
     * @param role
     * @param lvl
     * @returns Promise<TechnologyExpertise|any[]>
     */
    public static getForRole(role:Role, lvl: ExpertiseLevel): Promise<TechnologyExpertise|any[]> {
        let branch:KnowledgeBranch|any = Technology.getBranchForRole(role) || {_id:-1};

        return (new Technology).findAll({
            parent: branch._id
        }).then((tech:any[]) => {
            let max = TechnologyExpertise.getMaxTech(lvl);
            while (tech.length > max)
                tech.splice(Math.floor(Math.random()*tech.length), 1);

            return tech.map(t =>
                (new TechnologyExpertise(branch, t._id, lvl)).list
            );
        });
    }


    /**
     * getBranchForRole
     *
     * Role have certain branch, other should be treated as irrelevant in many cases
     *
     * @param role
     * @returns {KnowledgeBranch|any}
     */
    public static getBranchForRole(role:Role)
    {
        let branch:KnowledgeBranch|any = null;
        switch ((<any>role).name) {
            case 'Sale':
                branch = Technology.getKnownBranch(KnownBranch.Marketing)
                break;
            case 'BA':
            case 'Accountant':
                branch = Technology.getKnownBranch(KnownBranch.Finance);
                break;
            case 'Developer':
                branch = Technology.getKnownBranch(KnownBranch.Programming);
                break;
        }
        return branch;
    }

    /**
     * determineMedianSalary
     *
     * @param exs TechnologyExpertise[]
     * @param role Role|null
     * @returns {Promise<number>}
     */
    public static determineMedianSalary(exs: TechnologyExpertise[]|any[], role:Role|null = null):Promise<number> {
        let branchId = (role && role.branch && role.branch._id) || null,
            salary = (branchId && role.branch.salary) || 0;
        return Promise.all(
            (<Array<TechnologyExpertise>>exs).filter((ex:any) => branchId != (ex.branch._id || ex.branch))
                .map((ex:any) => {
                    ex = (new TechnologyExpertise(<TechnologyExpertiseCommon>ex));
                    return ex.populate()
                        .then((tex: TechnologyExpertise|any) => {
                            return tex.salary
                        })
                })
        )
        .then((mids:number[]|any[]) => {
            let big3:number[] = U.big3(mids),
                rest:number[] = mids.slice(0).filter(_a => !big3.includes(_a)),
                sal:number = U.sum(big3) || Technology.defaultSalary,
                bonus:number = U.sum(rest) * rest.length / 10;

            return sal + bonus;
        });

    }

}
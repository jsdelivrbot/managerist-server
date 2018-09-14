import {Technology, TechnologyExpertiseCommon, KnowledgeBranch, ExpertiseLevel} from "./technology";
import {U} from "../../common/u";
/**
 * Class TechnologyExpertise
 *
 *  @todo exxtend From Dictionary
 * backend model for TechnologyExpertiseCommon
 */
export class TechnologyExpertise extends TechnologyExpertiseCommon {
    public branch: KnowledgeBranch|any;
    public technology: Technology|any;
    public volume: any;
    public level:ExpertiseLevel;
    /**
     * constructor
     *
     * overload to make possible creation aout of ~common
     *
     * @param branch
     * @param technology
     * @param volume
     * @param level
     * @return {any}
     */
    constructor(
        branch: KnowledgeBranch|TechnologyExpertiseCommon|any,
        technology: Technology|any = null,
        level:ExpertiseLevel = ExpertiseLevel.Middle,
        volume: number|ExpertiseLevel = 0
    ) {
        super(
            (<any>branch).branch || branch,
            (<any>branch).technology || technology,
            (<any>branch).level || level,
            ((<any>branch).level && (<any>branch).volume) || volume
        );
    }

    /**
     *
     * @returns {Promise<TechnologyExpertise>}
     */
    populate() : Promise<TechnologyExpertise> {
        let tid = this.technology._id || this.technology,
            bid = this.branch._id || this.branch;
        return Promise.all([
            (new Technology).findById(tid),
            (new Technology).findById(bid)
        ])
            .then((ts:any[]) => {
                for(let t of ts) {
                    let _tid:string = <string>t._id;
                    if (_tid == '' + tid)
                        this.technology = t.common;
                    if (_tid == bid)
                        this.branch = t.common;
                }
                return this;
            });
    }

    /**
     *
     * @returns {number}
     */
    get salary() {
        return this.getSalary();
    }

    /**
     * 
     * @param lvl 
     */
    getSalary(lvl:ExpertiseLevel = null) {
        lvl = lvl || this.level;
        let mid = (<any>this.technology).salary || 0,
            lCoefs = {
                [ExpertiseLevel.Intern]: 0.1,
                [ExpertiseLevel.Junior]: 0.5,
                [ExpertiseLevel.Middle]: 1,
                [ExpertiseLevel.Senior]: 1.75,
                [ExpertiseLevel.Expert]: 2.5
            };
        return mid * lCoefs[U.en(ExpertiseLevel, lvl)];
    }
}

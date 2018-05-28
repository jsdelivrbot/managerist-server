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
    public technology: Technology|any = null;
    public volume: any = 0;
    public level:ExpertiseLevel = ExpertiseLevel.Middle;
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
        super(0);
        if (typeof branch == 'object' && !(branch instanceof KnowledgeBranch) && !(branch instanceof Technology || branch.parent)) {
            let anybranch:any = (<any>branch);
            super(anybranch.branch, anybranch.technology, isNaN(+anybranch.level) ? ExpertiseLevel[anybranch.level] : anybranch.level, anybranch.volume);
        } else
            super(branch, technology, level, volume);
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
        let mid = (<any>this.technology).salary || 0;
        let mul = 1;
        if (ExpertiseLevel.Expert == U.en(ExpertiseLevel, this.level))
            mul = 5;
        else if (ExpertiseLevel.Senior == U.en(ExpertiseLevel, this.level))
            mul = 1.8;
        else if (ExpertiseLevel.Middle == U.en(ExpertiseLevel, this.level))
            mul = 1;
        else if (ExpertiseLevel.Junior == U.en(ExpertiseLevel, this.level))
            mul = 0.7;
        else
            mul = 0.5;
        return mid * mul;
    }
}

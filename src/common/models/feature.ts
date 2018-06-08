import {Technology, KnowledgeBranch, TechnologyUsage} from "./technology";
import {Company} from "./company";

export enum FeatureSpecial{Documentation, TechnicalDocumentation, AutomatesTests, Bug};
/**
 * Class Feature
 */
export class Feature {
    _id:any;
    name:string = '';
    complexity: number = 1;
    volume: number = 0;
    implementations:TechnologyUsage[][];
    //TBD: industry: Industry
    branch: KnowledgeBranch;
    inventor: Company;
}

/**
 * Class FeatureValue
 *
 *  To determine how Feature is required for the Audience
 */
export class FeatureValue {
    constructor(
        public feature:Feature|any,
        public key:boolean = false,
        public value: number
    ){}
}

/**
 * Class FeatureImplementation
 *
 *  To determine and distinct implementations of the same feature in different products
 */
export class FeatureImplementation {
    public technologies: TechnologyUsage[] = [];
    public priority: number = 0;
    // Numbers in hours
    public size:number = 0; // total time spend
    public todo:number = 0; // planned for next upgrade
    public completed:number = 0; // next upgrade progress

    public version:number = 0;   // Iteration number, 0 ~ first attempt

    public quality:number = 0;
    public value:number = 0; // ???
    constructor(
        public feature:Feature|any,
    ) {
        for (let p of Object.getOwnPropertyNames(this))
            if (feature[p])
                this[p] = feature[p];
    }

    get list() {
        let l = {};
        for (let p of Object.getOwnPropertyNames(this))
            if (p == 'feature')
                l[p] = (this[p]._id || this[p]);
            else if (p == 'technologies')
                l[p] = this[p].map(t => t.list || t);
            else
                l[p] = this[p];
        return l;
    }

    get implemented():boolean { return (this.version || 0) > 0;};
    get estimated():boolean { return (this.todo || 0) > 0;};
    get designed():boolean { return this.implemented || this.estimated;};
}

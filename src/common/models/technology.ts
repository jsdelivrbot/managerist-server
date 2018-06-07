import { U } from "..";

/**
 * @deprecated  ~ no sence - hsould be technology, and thats it
 * Basic (Root) Technologies
 */
export class KnowledgeBranch {
    constructor(
        public _id: any,
        public name: string = '',
        public volume: number = 0,
        public complexity: number = 0,
        public salary: number = 0
    ) {}
}

/**
 *
 */
export class Technology {
    _id: any;
    name: string = '';
    salary: number = 800; // median salary for technology / for Mid-level specialist
    volume: number = 0;
    complexity: number = 0;
    // Refs
    parent: Technology; // KnowledgeBranch or another tech;
}

/**
 * To describe how much certain technology was used in feature(product) to determine level of expertise needed to proceed
 */
export class TechnologyUsage {
    constructor(
        public technology: Technology,
        public volume: number // field used
    ) {}

    get list() {
        return {
            technology: this.technology._id || this.technology,
            volume: this.volume
        };
    }

    /**
     * mergeFullGroups
     * 
     * merge TechnologyUsages that are full groups
     * @param tu1 
     * @param tu2 
     * @param tu1Value 
     * @param tu2Volume 
     */
    public static mergeFullGroups(tu1:TechnologyUsage[], tu2:TechnologyUsage[], tu1Value:number = 0.5, tu2Value?:number):TechnologyUsage[]{
        tu2Value = tu2Value || (1 - tu1Value);
        let tu:TechnologyUsage[];
        if (!tu1.length) return tu2;
        if (!tu2.length) return tu1;
        if (!TechnologyUsage.isFullGroup(tu1)) throw new Error('First param is not a full group');
        if (!TechnologyUsage.isFullGroup(tu2)) throw new Error('Second param is not a full group');

        tu = tu1.map(t => {
            t.volume = t.volume * tu1Value;
            return t;
        });
        for(let tt of tu2) {
            let prev = tu.find(t => t.technology == tt.technology);
            if (!prev) {
                tt.volume *= tu2Value;
                tu.push(tt);
            } else {
                tu = tu.map(t => {
                    if (t.technology == tt.technology)
                        t.volume = t.volume + tt.volume * tu2Value;
                    return t;
                });
            }
        }

        return tu;
    }

    /**
     *  Check if is full group
     * @param tu 
     */
    public static isFullGroup(tu:TechnologyUsage[])
    {
        let vlms = tu.map(t => t.volume),
            gr = U.sum(vlms);
        // 0.01 ~ precision for floating point
        return Math.abs(gr - 1) < 0.01;
    }
}

export enum ExpertiseLevel{Intern, Junior, Middle, Senior, Expert}

/**
 * To describe level of proficiency
 */
export class TechnologyExpertise {
    static randomLevel(minLevel:ExpertiseLevel = ExpertiseLevel.Intern, maxLevel:ExpertiseLevel = ExpertiseLevel.Expert) {
        return ((r) => {
            if (r > 0.9)
                return ExpertiseLevel.Expert;
            if (r > 0.8)
                return ExpertiseLevel.Senior;
            if (r > 0.6)
                return ExpertiseLevel.Middle;
            if (r > 0.2)
                return ExpertiseLevel.Junior;
            return ExpertiseLevel.Intern;
        })(Math.min(TechnologyExpertise.lvlToVal(maxLevel), Math.max(TechnologyExpertise.lvlToVal(minLevel), Math.random())));
    }

    static lvlToVal(lvl:ExpertiseLevel, upper:boolean = false) {
        lvl = U.en(ExpertiseLevel, lvl);
        let res = 0;
        if (ExpertiseLevel.Expert == lvl)
            res = 0.9;
        else if (ExpertiseLevel.Senior == lvl)
            res = 0.8;
        else if (ExpertiseLevel.Middle == lvl)
            res = 0.6;
        else if (ExpertiseLevel.Junior == lvl)
            res = 0.2;

    return res + (upper ? 0.1 : 0);
    }
    static get milestones():number[] { return [0.95, 0.7, 0.3, 0.1];}
    static getMaxTech(lvl:ExpertiseLevel, branch:KnowledgeBranch|null = null) {
        let res = 0;
        if (ExpertiseLevel.Expert == lvl)
            res = 10;
        else if (ExpertiseLevel.Senior == lvl)
            res = 5;
        else if (ExpertiseLevel.Middle == lvl)
            res = 3;
        else if (ExpertiseLevel.Junior == lvl)
            res = 2;
        else
            res = 1;

        return res;
    }
    constructor(
        public branch: any,
        public technology: any = null,
        public level:ExpertiseLevel = ExpertiseLevel.Middle,
        public volume: any = 0,
    ) {
        if (!volume)
            this.invalidateVolume();
    }

    /**
     * invalidateLevel
     *
     * determines level of expertize by volume
     *
     * @returns TechnologyExpertise
     */
    invalidateLevel(): TechnologyExpertise {
        if (!this.technology._id) return null;
        let prc = this.volume;

        this.level = ExpertiseLevel.Intern;

        if (0.95 < prc)
            this.level = ExpertiseLevel.Expert;
        else if (0.8 < prc)
            this.level = ExpertiseLevel.Senior;
        else if (0.3 < prc)
            this.level = ExpertiseLevel.Middle;
        else if (0.1 < prc)
            this.level = ExpertiseLevel.Junior;

        return this;
    }

    /**
     * invalidateVolume
     *
     * to set volume according to level
     *
     * @param lvl
     * @returns TechnologyExpertise
     */
    invalidateVolume(lvl:ExpertiseLevel = null): TechnologyExpertise {
        lvl = U.en(ExpertiseLevel, lvl || this.level);

        if (ExpertiseLevel.Expert == lvl)
            this.volume = 1 - 0.05*Math.random();
        else if (ExpertiseLevel.Senior == lvl)
            this.volume = 0.95 - 0.25*Math.random();
        else if (ExpertiseLevel.Middle == lvl)
            this.volume = 0.7 - 0.4*Math.random();
        else if (ExpertiseLevel.Junior == lvl)
            this.volume = 0.3 - 0.2*Math.random();
        else
            this.volume = 0.1*Math.random();

        return this;
    }

    /**
     * getter list
     *
     * to retrieve plain object
     *
     * @returns {{branch: any, technology: any, level: ExpertiseLevel}}
     */
    get list():any {
        let res = {
            branch: this.branch._id || this.branch,
            technology: this.technology._id || this.technology,
            volume: this.volume,
            level: ExpertiseLevel[this.level]
        };

        return res;
    }
}

/*
Learning curve depending on employee basic params ~
TODO: add learning-curve type, now it's progressive, the more you know the less effort you need to learn the rest
TODO: but there maybe cases

Approach can be viewed here: http://gallery.echartsjs.com/editor.html?c=xSkmshskfG&v=3

var days = 50;
var iq = 1.1,
    f = .7;
var wholeVolume = 3000,
    learnt = 1500;
var complexity = 2.1 * (1 - learnt/ wholeVolume);
var volume = days,
    tvolume = 0;
var d = 0;
for (var i = 0; i < days; i++) {
    var date = new Date(dottedBase += 1000 * 3600 * 24);
    category.push([
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    ].join('-'));
    let r0 = Math.pow((1-f)*Math.random(), 1),
        r1 = Math.pow((1-f)*Math.random(),0.5)*0.25,
        r2 = Math.pow((1-f)*Math.random(),0.5)*0.5;
    d += 1;
    let learn = Math.max(((iq - r1)/(complexity + r2)) - r0, 0);
    tvolume+= learn;
    learnt += learn;
    complexity = 2.1 * (1 - Math.pow(learnt/ wholeVolume,0.5))
    //tvolume+= Math.max(1 + iq * (1-r1) - complexity * (1+r2) - r0, 0);
    barData.push(tvolume)
    lineData.push(Math.min(d, volume));
}
*/
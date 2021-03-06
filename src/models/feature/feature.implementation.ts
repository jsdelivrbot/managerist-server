import {FeatureImplementation as FeatureImplementationCommon, Bug as BugCommon} from "../../common/models/feature";
import {Feature} from "."
import {Employee} from "../employee"
import {U} from "../../common/u"
import {Technology, KnownBranch, TechnologyExpertise, TechnologyUsage} from "../technology";
import { Log, LogLevel } from "../../core/utils/log";

export class Bug extends BugCommon {}

/**
 * Class FeatureImplementation
 *
 *  Overloading common (possibly will be stored in DB)
 */
export class FeatureImplementation extends FeatureImplementationCommon {
    
    /**
     * 
     * @param fis1 FeatureImplementation[]
     * @param fis2 FeatureImplementation[]
     * @returns FeatureImplementation[]
     */
    static merge(fis1:FeatureImplementation[], fis2:FeatureImplementation[]):FeatureImplementation[] {
        let fis1F = fis1.map((fi) => (fi.feature._id || fi.feature).toString()),
            fis2upd:FeatureImplementation[] = fis2.filter(fi => fis1F.includes(fi.feature._id || fi.feature).toString()),
            fis2uniq = fis2.filter(fi => !fis1F.includes(fi.feature._id || fi.feature).toString());
        fis1 = fis1.map((fi) => {
            let fi2 = fis2upd.find(_fi => 
                (fi.feature._id || fi.feature).toString() == (_fi.feature._id || _fi.feature).toString()
            );
            return fi2
                ? (new FeatureImplementation(fi)).merge(fi2)
                : fi;
        });
        fis1 = fis1.concat(fis2uniq);
        return fis1;
    }

    /**
     * @param fi 
     * @returns FeatureImplementation
     */
    merge(fi:FeatureImplementation):FeatureImplementation {
        if (this.implemented) {
            let parity = this.size / fi.completed;
            this.technologies = TechnologyUsage.mergeFullGroups(this.technologies || [], fi.technologies, parity);
            this.quality = (parity * this.quality + (1 - parity) *fi.quality) / 2;
            this.version = Math.max(this.version, fi.version);            
        } else {
            this.list = fi.list || fi;
        }
        return this;
    }

    /**
     * designImplementation
     *
     * if employee is "architect" of solution, basing on his knowledge quality, estimation, technologies
     *
     * @param e Employee|any  - "any" added for compiler (virtual properties alerts "no property")
     * @returns {Promise<FeatureImplementation>}
     */
    designImplementation(e:Employee|any): Promise<FeatureImplementation> {
        let relevantExp:TechnologyExpertise[] = [];
        let pFeature = this.feature._id
            ? this.feature
            : (new Feature(e.ga)).findById(this.feature);

        return pFeature
            .then((f:any) => this.feature = f)
            .then(() => {
                for (let exp of e.expertise) {
                    if ((exp.branch._id || exp.branch).toString() == (this.feature.branch._id || this.feature.branch).toString())
                        relevantExp.push(exp);
                }
                if (!relevantExp.length)
                    throw new Error('This Employee have no expertise for this Feature.');
                // To select best expertise
                relevantExp = U.big3o(relevantExp, 'volume');
            })
            .then(() => {
                let tids = relevantExp.map(rt => (rt.technology._id || rt.technology).toString());
                return (new Technology).findAll({_id: tids})
            })
            .then((techs:Technology[]) => {
                let techsU:TechnologyUsage[] = [],
                    volume0 = this.feature.volume || Feature.defaultVolume,
                    mul = 1,
                    // The less expertise level there more chances to (over/under)estimation
                    rnd2 = (v) => 1 + Math.random()*v - Math.random()*v;
                techsU.push(new TechnologyUsage(techs[0]._id, techs[1] ? 0.7 : 1));

                // (2 - relevantExp[0].volume)  == too weak!!! should be 1-6

                mul = techs[0].complexity * rnd2(relevantExp[0].volume);
                volume0 = techs[1]
                    ? volume0 * 0.3 + 0.7*(volume0 * mul)
                    : volume0 * mul;
                if (techs[1]) {
                    techsU.push(new TechnologyUsage(techs[1]._id, relevantExp[2] ? 0.25 : 0.3));
                    mul = techs[1].complexity * rnd2(relevantExp[1].volume);
                    volume0 = techs[2]
                        ? volume0 * 0.7 + 0.3*(volume0 * mul)
                        : volume0 * 0.75 + 0.25*(volume0 * mul);
                }

                if (techs[2]) {
                    techsU.push(new TechnologyUsage(techs[2]._id, 0.05));
                    mul = techs[1].complexity * rnd2(relevantExp[1].volume);
                    volume0 = volume0 * 0.95 + 0.05*(volume0 * mul);
                }

                // TODO: check language complexities
                this.todo = volume0 * (1 + techsU.length/10);
                this.technologies = techsU;
                return this;
            });
    }

    /**
     *
     * @param e
     * @returns {Promise<FeatureImplementation>}
     */
    designUpgrade(e:Employee): Promise<FeatureImplementation>  {
        if (!this.version && !this.todo)
            return this.designImplementation(e);
        // TODO
        if (1) throw new Error('FeatureImplementation Upgrade, not yet implemented');
        return Promise.resolve(this);
    }

    set list(obj:any) {
        for (let bp of Object.getOwnPropertyNames(obj))
            (<any>this)[bp] = obj[bp];
    }

    get list():any {
        let res:any = {};
        for (let bp of Object.getOwnPropertyNames(this)) {
            if (['list'].includes(bp))
                continue;
            else if ('feature' == bp)
                res[bp] = this.feature._id || this.feature;
            else if ('technologies' == bp)
                res[bp] = this.technologies.map((t:TechnologyUsage) => t.list);
            else if ((typeof (<any>this)[bp]).toLowerCase() != <any>'function')
                res[bp] = (<any>this)[bp];
        }
        return res;
    }

    /**
     * burnout
     * 
     * @param seconds number
     * @param employees Employee[]
     * @return Promise<FeatureImplementation>
     */
    burnout(seconds:number, employees:Employee[] = []): Promise<FeatureImplementation> {
        let currQ = this.calcQuality(employees);
        if (this.completed && !currQ)
            throw new Error("That's too many bugs, - zero quality. Project failed.");

        this.completed =  (this.completed || 0) + seconds;
        
        this.quality = 1;
        if (currQ)
            this.quality = (this.quality * (this.todo - seconds) + seconds * currQ) / this.todo;
        return Promise.resolve(true)
            .then(() => this);
    }

    calcQuality(employees: Employee[]) {
        let empsEfficiency = employees.reduce((a, e: Employee) => {
                let ee = e.calculateTechEfficiency(this.technologies);
                return a + ee / employees.length;
            }, 0),
            bugsBurden = Math.max(0,
                1 - this.bugs.reduce((a, b) => a + b.critical * (b.fixed ? 0 : (b.detected ? 0.5 : 1)), 0) / Feature.defaultAllowedBugs
            );
        Log.log("Emps(" + employees.length  + "): " + U.floor(empsEfficiency, 2) + " bugs: " + bugsBurden, LogLevel.Warning);
        return empsEfficiency * bugsBurden;
    }
}
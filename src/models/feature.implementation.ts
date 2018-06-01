import {FeatureImplementation as FeatureImplementationCommon} from "../common/models/feature";
import {Feature} from "./feature"
import {Employee} from "./employee"
import {U} from "../common/u"
import {Technology, KnownBranch, TechnologyExpertise, TechnologyUsage} from "./technology";

/**
 * Class FeatureImplementation
 *
 *  Overloading common (possibly will be stored in DB)
 */
export class FeatureImplementation extends FeatureImplementationCommon {
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
        for (let bp of obj)
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
            else if (!Number.isNaN(+bp))
                res[bp] = (<any>this)[bp];
        }
        return res;
    }
}
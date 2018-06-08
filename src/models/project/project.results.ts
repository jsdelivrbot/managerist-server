import {ProjectResults as ProjectResultsCommon} from '../../common/models/project'
import { U } from '../../common';
import {Project, ProjectStatus} from './project'
import { Product } from '..';
import { FeatureImplementation } from '../feature.implementation';

export class ProjectResults extends ProjectResultsCommon {
    constructor(protected _project:Project) {
        super();        
        if (!this._project._id)
            throw new Error('Project should be full valid Project ActiveRecord');
    }

    resume() {
        if (!this._project.isReady)
            throw new Error('Project state "' + U.e(ProjectStatus, this._project.status) + '" is not where it\'s reward can be applied.');

        let pProduct = this._project.product._id
            ? Promise.resolve(this._project.product)
            : new Product(this._project.ga).findById(this._project.product);
        return pProduct
            .then((pr:Product) => this._applyProductReward(pr));
    }

    protected _applyProductReward(prd:Product):Promise<any> {
        let features:FeatureImplementation[] = FeatureImplementation.merge(prd.features, this._project.features);
        prd.populate({features:features});
        prd.populate(this.product || {});
        return prd
            .invalidateStatus()
            .save();
    }
}
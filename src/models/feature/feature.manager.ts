import { Feature } from "./feature";
import { FeatureImplementation } from "../feature.implementation";

export class FeatureManager {
    constructor(protected _feature:Feature) {
        if (!this._feature._id)
            throw new Error('Feature should be full populated obj.');
    }

    /**
     * upgrade "World Experience" in completing certain feature/exercise
     * 
     * @param fi 
     * @returns Promise<Feature>
     */
    upgrade(fi: FeatureImplementation): Promise<Feature> {
        this._feature.implementations = this._feature.implementations || [];
        this._feature.implementations.push(fi.technologies);
        this._feature.volume =  ((this._feature.volume || fi.size) + fi.size) / 2;
        this._feature.complexity =  (this._feature.complexity + (2-fi.quality)) / 2;
        return  this._feature.save()
            .then(() => this._feature);
    }
}
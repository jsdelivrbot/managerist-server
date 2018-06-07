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
        // TODO
        return  this._feature.save()
            .then(() => this._feature);
    }
}
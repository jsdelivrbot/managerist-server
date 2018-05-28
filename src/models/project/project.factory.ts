import {Company} from "../company/company";
import {Product, ProductStage} from "../product/product";
import {Project} from "./project";
import {U} from "../../common/u";
import {FeatureImplementation} from "../feature.implementation";
import {Department} from "../department";
export class ProjectFactory {
    private _product: Product;

    constructor(private _company:Company) {
        console.log('ProjectFactory:Constructor');
        if (!_company._id)
            throw new Error('ProjectFactory: Company should be full, not a reference.');
    }

    /**
     *
     * @param product
     * @param options
     * @returns {Promise<Project>}
     */
    public generate(product:Product, options:any = null):Promise<Project> {
        console.log('ProjectFactory:Generation');
        if (!product || !product._id)
            throw new Error('ProjectFactory:generate: Product should be full, not a reference.');
        this._product = product;

        let features:any = [],
            strProdStage:string = U.e(ProductStage, this._product.stage);
        switch(strProdStage) {
            case 'New':
                features = this._product.features.map(f => new FeatureImplementation(f.feature));
                break;
            case 'Maintenance':
                throw new Error('Extend-Support type projects not implemented yet.');
                break;
            case 'Closed':
                throw new Error('Product already closed.');
            default:
                features = U.big3o(this._product.features, 'priority').map(f => new FeatureImplementation(f.feature))
        }
        let dep = Department.getByName('Production');
console.log('PRJ GEN:', {
    company: this._company._id,
    department: dep._id,
    product: this._product._id,
    features: features
});
        let prj;
        try {
            prj = (new Project(this._product.ga));
        } catch(e) {
            console.log('\n\n\n\n\n :( PRJ NOT ...CONSTRUCTED???', e.message,'\n\n\n\n\n');
        }
console.log('\n\n\n\n\n :( PRJ CONSTRUCTED...','\n\n\n\n\n');
        return prj
            .populate({
                company: this._company._id,
                department: dep._id,
                product: this._product._id,
                features: features,
    //                todo: 1000, // TODO
    //                completed: 0,
    //                testingTodo: 200, // TODO
    //                testingCompleted: 0,
    //                deployTodo: 40,  // TODO
    //                deployCompleted: 0
            })
            // TODO
            // all features if Startup
            // some features if Sprint(Upgrade common prj)
            // design featuresImplementations for features in project (maybe through delayed event)
            .save()
            .catch(e => {
                console.log('\n\n\n\n\n :( PRJ NOT SAVED', e.message,'\n\n\n\n\n');
                throw new Error(e);
            });
    }
}
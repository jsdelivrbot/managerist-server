import {Company} from "../company/company";
import {Product, ProductStage} from "../product/product";
import {Project} from "./project";
import {U} from "../../common/u";
import {FeatureImplementation} from "../feature/feature.implementation";
import {Department} from "../department";
import { LogLevel, Log } from "../../core/utils/log";
export class ProjectFactory {
    private _product: Product;

    constructor(private _company:Company) {
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
        Log.log('ProjectFactory:Generation for Product:' + (product._id || product), LogLevel.Debug);
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
            case 'Closed':
                throw new Error('Product already closed.');
            default:
                features = U.big3o(this._product.features, 'priority').map(f => new FeatureImplementation(f.feature))
        }
        let dep = Department.getByName('Production');

        return <Promise<Project>>(new Project(this._product.ga))
            .populate({
                company: this._company._id,
                department: dep._id,
                product: this._product._id,
                features: features
            })
            // TODO
            // all features if Startup
            // some features if Sprint(Upgrade common prj)
            // design featuresImplementations for features in project (maybe through delayed event)
            .save();
    }
}
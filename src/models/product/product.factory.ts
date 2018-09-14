import {Company} from "../company/company";
import {Product} from "./product";
import {Feature} from "../feature";
import {U} from "../../common/u";
import {FeatureImplementation} from "../feature/feature.implementation";
import {ProjectFactory} from "../project/project.factory";
import {Game} from "../game";
import { Log, LogLevel } from "../../core/utils/log";

export class ProductFactory {
    constructor(private _company:Company) {
        if (!_company._id)
            throw new Error('ProductFactory: Company should be full, not a reference.');
    }

    /**
     *
     * @param data
     * @returns {Promise<Product>}
     */
    public generate(data:any = {}):Promise<Product> {
        data.name = data.name || U.projectName();
        data.company = this._company;
        Log.log('Generate new Product for: ' + this._company.name, LogLevel.Debug);
        return (new Product(this._company.ga, data))
            .save()
            .then((p:Product) => {
                //noinspection TypeScriptValidateTypes
                return Feature.generateForProduct(p, 3)
                    .then((F:Feature[]) =>
                        Promise.all(F.map((f =>
                                new FeatureImplementation(f._id)
                        )))
                    )
                    .then((fi:FeatureImplementation[]) => {
                        return <Promise<Product>>p
                            .populate({features: fi})
                            .save()
                    })
            })
            .then((product:Product) => {
                return (new Game).findById(this._company.ga.gameId)
                    .then((g: Game) => {
                        if (g.options.autoManageProjects)
                            return (new ProjectFactory(this._company))
                                .generate(product)
                                .then(() => product);
                        return product;
                    })
            });
    }
}
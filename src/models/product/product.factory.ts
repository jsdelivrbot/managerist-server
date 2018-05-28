import {Company} from "../company/company";
import {Product} from "./product";
import {Feature} from "../feature";
import {U} from "../../common/u";
import {FeatureImplementation} from "../feature.implementation";
import {ProjectFactory} from "../project/project.factory";
import {Game} from "../game";

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
        data.name = data.name || U.randomName();
        data.company = this._company;
        console.log('Generate new Product for: ' + this._company.name);
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
                console.log('Product successfully saved.');
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
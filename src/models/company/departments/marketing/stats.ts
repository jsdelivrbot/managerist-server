import {Company, CompanyFinancials} from "../../company";
import {Credit} from "../../../credit";
import {U} from "../../../../common/u";
import {Employee} from "../../../employee";
import {Department, KnownDepartments} from "../../../department";
import {MarketingAlerts} from "./alerts";
import {DepartmentStats} from "../stats";
import {DepartmentAlertsInterface} from "../alerts";
import {CompanyDepartmentInterface} from "../company.department";
import {MarketingCompanyDepartment} from "./department";
import { Product } from "../../..";
import { Feature } from "../../../feature";

/**
 * Class ProductionStats
 *
 */
export class MarketingStats extends DepartmentStats {
    protected static _departmentDetailsClass:CompanyDepartmentInterface = MarketingCompanyDepartment;
    protected static _alertsClass: DepartmentAlertsInterface = MarketingAlerts;
    protected _ordinalEmployeeEfficiency:number = 0.1;

    /**
     * get workload
     *
     * return required numbers in man/hours for the month
     *
     * @returns {Promise<number>}
     */
    public get workload():Promise<number> {
        return (new Product(this._company.ga))
            .findAll({company:this._company._id})
            .then((prods:Product[]) =>
                Promise.all(
                    prods.map((p:Product) =>  
                        Promise.all(
                            p.features.map(fi => 
                                (new Feature(p.ga)).findById(fi.feature)
                                    .then((f:Feature) => f.volume)
                            )
                        )
                        .then((wls:number[]) => {
                            return U.sum(wls);
                        })
                    )
                )
                .then((wls:number[]) => {
                    return U.sum(wls);
                })
            );
    }

    /**
     * get capacity
     *
     * return available numbers in man/hours
     *
     * @returns {Promise<number>}
     */
    public get capacity():Promise<number> {
        return super.capacity
            .then((salesCapacity:number) => {
                let ordinalEmpsCapacity = 
                    this._employees.filter(e => 
                        !this._depEmployees.map(de => de._id.toString()).includes(e._id.toString())
                    ).reduce((a,e:Employee) => 
                        a + this._ordinalEmployeeEfficiency * e.character.Communication * (1 - e.character.Trustworthy),
                        0
                    );
                return salesCapacity + ordinalEmpsCapacity;
            });
    }

    /**
     * get complexity
     *
     * return complexity of the processes
     *
     * @returns {Promise<number>}
     */
    public get complexity():Promise<number> {
        return (new Product(this._company.ga))
        .findAll({company:this._company._id})
        .then((prods:Product[]) =>
            Promise.all(
                prods.map((p:Product) =>  
                    Promise.all(
                        p.features.map(fi => 
                            (new Feature(p.ga)).findById(fi.feature)
                                .then((f:Feature) => f.complexity)
                        )
                    )
                    .then((wls:number[]) => U.avg(wls))
                )
            )
            .then((wls:number[]) => U.avg(wls))
        );
    }

    /**
     * @property salesEfficiency number
     * 
     * efficiency in selling products in general
     */
    public get salesEfficiency(): Promise<number> {
        // TODO
        return this.efficiency;
    }
}

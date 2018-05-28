import {DepartmentAlerts} from "../alerts";
import {Alert} from "../../../alerts/alert";
import {AlertType} from "../../../alerts/alert.type";
import {Company} from "../../company";
import {U} from "../../../../common/u";

export enum KnownProductionAlerts {NoDevelopers}
export class ProductionAlerts extends DepartmentAlerts {
    protected static _departmentName:string = 'Production';
}

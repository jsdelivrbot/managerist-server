import {Department} from "../../department";
import {ActiveRecord, MongoTypes} from "../../../core/db/active.record";
import {U} from "../../../common/u";
import {Alert, AlertLevel, AlertType} from "../../alerts";
import {Company} from "../company";
import {Game} from "../../game";
export interface DepartmentAlertsInterface {
    new(_company:Company):DepartmentAlerts;
}
export abstract class DepartmentAlerts {
    protected static _departmentName:string;
    protected _department:Department;
    protected _errorTypes:any[];
    protected _warningTypes:any[];
    protected _successTypes:any[];
    protected _infoTypes:any[];

    constructor(protected _company:Company) {
        //noinspection TypeScriptUnresolvedVariable
        this._department = Department.getKnown((<any>this.constructor)._departmentName);
        this._errorTypes = (new AlertType).search({
            department: this._department._id,
            level: 'error'
        }).map((at:any) => at._id);

        this._warningTypes = (new AlertType).search({
            department: this._department._id,
            level: U.e(AlertLevel, AlertLevel.warning)
        }).map((at:any) => at._id);

        this._successTypes = (new AlertType).search({
            department: this._department._id,
            level: U.e(AlertLevel, AlertLevel.success)
        }).map((at:any) => at._id);

        this._infoTypes = (new AlertType).search({
            department: this._department._id,
            level: U.e(AlertLevel, AlertLevel.info)
        }).map((at:any) => at._id);
    }

    /**
     * @returns Promise<Alert[]>
     */
    alerts():Promise<Alert[]> {
        return this._getAlertByType(
            this._errorTypes
                .concat(this._warningTypes)
                .concat(this._successTypes)
                .concat(this._infoTypes)
        );
    }

    /**
     * @returns Promise<Alert[]>
     */
    get errors():Promise<Alert[]|ActiveRecord[]> {
        return this._getAlertByType(this._errorTypes);
    }

    /**
     * @returns Promise<Alert[]>
     */
    get warnings():Promise<Alert[]> {
        return this._getAlertByType(this._warningTypes);
    }

    /**
     * @returns Promise<Alert[]>
     */
    get info():Promise<Alert[]> {
        return this._getAlertByType(this._infoTypes);
    }

    /**
     * @returns Promise<Alert[]>
     */
    get success():Promise<Alert[]> {
        return this._getAlertByType(this._successTypes);
    }

    /**
     *
     * @param t
     * @returns {Promise<Alert[]>}
     * @private
     */
    protected _getAlertByType(t:any):Promise<Alert[]> {
        return <Promise<Alert[]>>(new Alert(this._company.ga).withRelations(['type']).findAll({
            company: this._company._id,
            department:  this._department._id,
            ignored: [false, null],
            resolved: [false, null],
            type: t
        }));
    }

    /**
     *
     * @param alertType
     * @returns {Promise<Alert>}
     */
    throwKnown(alertType:AlertType|any, data:any = null): Promise<Alert>
    {
        let game:Game,
            adata:any = {
                type: alertType._id,
                company: this._company._id,
                resolved: false
            };
        return (new Game).findById(this._company.ga.gameId)
            .then((g:Game) => game = g)
            .then(() => (new Alert(this._company.ga)).find(adata))
            .then((a:Alert|null) => {
                return a || (new Alert(this._company.ga)).populate(adata)
            })
            .then((a:Alert) => {
                a.populate({
                    department: this._department._id,
                    date: game.simulationDate,
                });
                if (data)
                    a.populate(data);
                return a.save();
            });
    }

    /**
     *
     * @param alertType
     * @returns {Promise<boolean>}
     */
    resolveKnown(alertType:AlertType|any): Promise<boolean>
    {
        let game:Game,
            adata:any = {
                type: alertType._id,
                company: this._company._id,
                resolved: false
            };
        return (new Game).findById(this._company.ga.gameId)
            .then((g:Game) => game = g)
            .then(() => (new Alert(this._company.ga)).find(adata))
            .then((a:Alert|null) => {
                return a && a.populate({resolved: true}).save();
            })
            .then(() => true);
    }
}

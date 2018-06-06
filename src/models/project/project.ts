import {Project as ProjectCommon, ProjectType, ProjectStatus, ProjectResults} from '../../common/models/project';
export {Project as ProjectCommon, ProjectType, ProjectStatus, ProjectResults} from '../../common/models/project';

import {SchemaTypes, ActiveRecord, ActiveRecordRule, ActiveRecordRulesTypes} from "../../core/db/active.record";
import {GameBased} from "../game.based";
import {FeatureImplementation} from "../feature.implementation";
import {Product, ProductStage} from "../product";
import {Company} from "../company";
import {Audience} from "../audience";
import {Position} from "../position";
import {Department} from "../department";
import {Employee} from "../employee";
import {U} from "../../common/u";
import { TechnologyUsage } from '../technology';
import { ProductionStats } from '../company/departments/production/stats';
import { AlertType } from '../alerts';
import { Log, LogLevel } from '../../core/utils/log';

/**
 * Class Project
 */
export class Project extends GameBased {
    // ~ common
    public _id: any;
    public name: string;
    public company: Company|any;
    public department: Department|any;
    public audience: Audience|any; // for marketing-type
    public product: Product;
    public features: FeatureImplementation[]; // features working on
    public type: ProjectType;
    public status: ProjectStatus;

    public todo: number;
    public completed: number;
    public testingTodo: number;
    public testingCompleted: number;
    public deployTodo: number;
    public deployCompleted: number;

    public startDate: number;  // timestamp
    public lastActivityDate: number;  // timestamp
    public endDate: number;  // timestamp

    public reward: ProjectResults;

    protected _common:any = ProjectCommon;
    protected _schema:any = {
        status: String,
        type: String,
        features : SchemaTypes.Mixed,
        product: { type: SchemaTypes.ObjectId, ref: 'Product' },
        reward : SchemaTypes.Mixed
    };

    get rules():{[key:string]:ActiveRecordRule} {
        return {
            status: {type:ActiveRecordRulesTypes.ENUM, related: ProjectStatus},
            type: {type:ActiveRecordRulesTypes.ENUM, related: ProjectType},
            //reward: {type: ActiveRecordRulesTypes.CUSTOM, related: ProjectResults}
        };
    }

    get technologies(){
        return this.features.reduce((tu, f) => TechnologyUsage.mergeFullGroups(f.technologies, tu), []);
    }

    /**
     *
     * @param emp
     * @returns {number}
     */
    estimate(emp:Employee):Promise<any> {
        return Promise.all(
                this.features.map((f:FeatureImplementation) =>
                    (new FeatureImplementation(f)).designUpgrade(emp))
            )
            .then((fi:FeatureImplementation[]) =>
                this.populate({
                    features: fi.map(f => f.list || f),
                    todo: U.sum(fi.map(f => f.todo)),
                    status: ProjectStatus.Active
                })
                .save()
            )
            .then(() =>
                (new Position(this.ga)).withRelations(['employee']).findAll({project: this._id})
                    .then((poss:Position[]) => {
                        return Promise.all(
                            poss.map((pos:Position) => {
                                let emp:Employee = <Employee>((new Employee(pos.ga)).populate(pos.employee));

                                return emp.calculateEfficiency(
                                        <Department>(Department.getById(this.department._id || this.department)),
                                        this
                                    )
                                    .then((eff: number) => {
                                        return Promise.all([
                                            pos.populate({efficiency: eff}).save(),
                                            emp.populate({efficiency: eff}).save()
                                        ])
                                    })
                            })
                        )
                    })
            );
    }

    /**
     * 
     * @param seconds 
     * @returns Promise<Project>
     */
    burnout(seconds:number) {
        let burned, completed;

        if (!this.isActive)
            throw new Error('You can\'t possiply make a progress on a non-active project.');

        return (new Position(this.ga))
            .findAll({project: this._id})
            .then((poss:Position[]) => {
                let distribution = U.dstr(this.features.length);
                burned = Math.min(
                    this.todo - this.completed,
                    U.sum(poss.map(pos => pos.efficiency * seconds))
                );
                completed = this.completed + burned;
                for (let i=0; i < this.features.length; i++)
                    this.features[i].completed = (this.features[i].completed || 0) + burned*distribution[i];

                return this.populate({
                        completed: completed,
                        status: this.todo <= completed ? ProjectStatus.Resolved : ProjectStatus.Active
                    })
                    .save();
            });
    }

    get isActive() {
        return ProjectStatus.Active == U.en(ProjectStatus, this.status);
    }

    get isReady() {
        return ProjectStatus.Resolved == U.en(ProjectStatus, this.status);
    }
    
    get isCompleted() {
        return [ProjectStatus.Resolved, ProjectStatus.Closed].includes(U.en(ProjectStatus, this.status));
    }
}

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

/**
 * p0x0 Class Project
 */
export class Project extends GameBased {
    // ~ common
    public _id: any;
    public name: string;
    public company: Company|any;
    public department: Department|any;
    public audience: Audience|any; // for marketing-type
    public product: Product|any;
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
        console.log('\n\nPRJ TECH getter\n\n');
        let tts = this.features.map(f => f.technologies);
        console.log('prj10', tts);
        console.log('prj11',[].concat(...tts));
        console.log('prj12',new Set([].concat(...tts)));
        console.log('prj13',...new Set([].concat(...tts)));
        console.log('prj14',[...new Set([].concat(...tts))]);
        // this.features.map(f => f.technologies.map(t => t._id || t));
        return [...new Set([].concat(...tts))];
    }

    /**
     *
     * @param emp
     * @returns {number}
     */
    estimate(emp:Employee) {
        return Promise.all(
                this.features.map((f:FeatureImplementation) =>
                    (new FeatureImplementation(f)).designUpgrade(emp))
            )
            .then((fi:FeatureImplementation[]) =>
                this.populate({
                    features: fi.map(f => f.list || f),
                    todo: U.sum(fi.map(f => f.todo))
                })
                .save()
            )
            .then(() =>
                (new Position(this.ga)).withRelations(['employee']).findAll({project: this._id})
                    .then((poss:Position[]) => {
                        return Promise.all(
                            poss.map((pos:Position) => {
                                let emp:Employee = <Employee>((new Employee(pos.ga)).populate(pos.employee));
console.log('\n\n\nPRJD:',this.department, '\n\n\n');
                                return emp.calculateEfficiency(
                                        <Department>(Department.getById(this.department._id || this.department)),
                                        this
                                    )
                                    .then((eff: number) => {
                                        console.log('NEW EFFF == ' + eff);
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
}

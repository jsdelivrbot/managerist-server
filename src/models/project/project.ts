import {Project as ProjectCommon, Bomb as BombCommon, ProjectType, ProjectStatus, ProjectResults} from '../../common/models/project';
export {Project as ProjectCommon, ProjectType, ProjectStatus, ProjectResults} from '../../common/models/project';

import {SchemaTypes, ActiveRecord, ActiveRecordRule, ActiveRecordRulesTypes} from "../../core/db/active.record";
import {GameBased} from "../game.based";
import {FeatureImplementation, Bug} from "../feature.implementation";
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
import { Feature } from '../feature';
import { FeatureManager } from '../feature/feature.manager';
import { Game } from '../game';

export class Bomb extends BombCommon {}

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
    public bombs: Bomb[];
    public type: ProjectType;
    public status: ProjectStatus;

    public todo: number;
    public quality: number;
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
        bugs : SchemaTypes.Mixed,
        bombs : SchemaTypes.Mixed,
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
     * burnout
     * 
     * @param seconds number
     * @param employees Employee[]
     * @returns Promise<Project>
     */
    burnout(seconds:number, employees:Employee[] = []):Promise<Project> {
        let burned, completed;

        if (!this.isActive)
            throw new Error('You can\'t possiply make a progress on a non-active project.');

        this.lastActivityDate = this.startDate + seconds;
        /** @hack ~ somewhere there should be interfaces or straiten property filler */
        this.features = this.features.map(f => new FeatureImplementation(f));

        let promisePrjDates: Promise<any> = this.startDate
            ? Promise.resolve(true)
            : (new Game).findById(this.ga.gameId)
                .then((g:Game) => {
                    this.startDate = g.simulationDate.getTime();
                    this.lastActivityDate = this.startDate + seconds;
                });
        return promisePrjDates
            .then(() => 
                (new Position(this.ga)).withRelations(['employee'])
                .findAll({
                    $or: [{
                            project: ActiveRecord.ID(this._id),
                            startDate: {$lt: this.lastActivityDate},
                            endDate: {$eq: null}
                        },{
                            project: ActiveRecord.ID(this._id),
                            startDate: {$lt: this.lastActivityDate},
                            endDate: {$gt: this.lastActivityDate}                        
                        },
                    ]

                })
            )
            .then((poss:Position[]) => {
                poss.map(p => Log.log({nm:"Position", id: p._id, start: p.startDate, end: p.endDate}, LogLevel.Debug, {color: "purple"}));
                let distribution = U.dstr(this.features.filter(_fi => _fi.estimated).length);
                burned = U.sum(poss.map(pos => pos.efficiency * seconds));
                completed = this.completed + burned;
                if (!employees.length) {
                    employees = poss.map(p => p.employee);
                }

                /** @todo cameup with leftover, currently added to "next version" of feature **/
                return Promise.all(
                    this.features.map((f) => {
                        if (!f.estimated) return f;
                        let portion = burned * distribution.pop();

                        // bugs
                        f.bugs = f.bugs || [];                        
                        f.bugs.push(...this.collectBugs(portion, this.startDate + portion));

                        return f.burnout(portion, employees);
                    })
                );
            })
            .then((fis:FeatureImplementation[]) => 
                Promise.all(
                    fis.map((fi:FeatureImplementation) => {
                        if (fi.estimated && fi.todo <= fi.completed) {
                            let pFeature = fi.feature._id
                                ? Promise.resolve(fi.feature)
                                : (new Feature(this.ga)).findById(fi.feature);
                            fi.size = (fi.size || 0) + fi.completed;
                            fi.completed = fi.completed - fi.todo;
                            fi.todo = 0;
                            fi.version++;
                            /** @todo maybe throw some Alert on global feature updated (then it means move all to game.manager level) */
                            return pFeature
                                .then((f:Feature) => new FeatureManager(f).upgrade(fi))
                                .then(() => fi)
                                .catch((e) => {
                                    throw new Error('Failed to upgrade "world experience" on feature: ' + (fi.feature._id || fi.feature));
                                });
                        }
                        return Promise.resolve(fi);
                    })
                )
                .then(() => fis)
            )
            .then((fi:FeatureImplementation[]) => {
                let compleatedFeatures = fi.filter(_fi => !_fi.estimated).length,
                    q = fi.length && (U.sumo(fi, "quality") / fi.length),
                    bombs = this.bombs || [];
                
                this.quality = q;

                // get(collect) bombs @todo 
                bombs.push(...this.collectBombs(seconds, this.startDate + completed));
                
                return this.populate({
                    completed: completed,
                    // Check if all features shoud be designed once again
                    status: compleatedFeatures == fi.length 
                        ? ProjectStatus.Resolved 
                        : ProjectStatus.Active,
                    features: fi,
                    bombs: bombs,
                    quality: q
                })
                .save()
            })
            .then(() => this);
    }

    /**
     * get(collect) bugs 
     * @todo   currently  ~ 1bug/day if 0% QA efficiency
     * @param seconds 
     */
    collectBugs(seconds: number, timestamp: number) {
        let bugs = [],
            day = 60*60*24;
        while(seconds > 0) {
            let quant = seconds < day ? seconds / day : day;
            if ((this.quality || 1) * Math.random() < (quant * (1 - this.ciPower) )) {
                bugs.push(<Bug>{
                    created: timestamp,
                    repeatable: Math.random(),
                    critical: Math.random(),
                    detected: +(Math.random() < this.qaPower),
                    fixed: 0
                });
            }
            seconds -= day;
        }
        return bugs;
    }

    /**
     * get(collect) bombs (potential deployment issues) 
     * @todo   currently  ~ once in a defaultFeature implementation time
     * @param seconds 
     */
    collectBombs(seconds: number, timestamp: number) {
        let bombs = [],
            def: number = Feature.defaultVolume;
        while(seconds > 0) {
            let quant = seconds < def ? seconds / def : def;
            if (this.quality * Math.random() < (quant * (1 - this.ciPower) )) {
                bombs.push(<Bomb>{
                    created: timestamp,
                    chances: Math.random(),
                    severity: Math.random() * (1 - this.ciPower)
                });
            }
            seconds -= def;
        }
        return bombs;
    }

    /**
     * 0-1
     * @todo 
     */
    get qaPower() {
        return 0;
    }

    /**
     * 0-1 
     * @todo
     */
    get ciPower() {
        return 0;
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

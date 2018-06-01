import {Game, GameActivity} from "./game";
import {Project, ProjectStatus} from "./project";
import {Position} from "./position"
import {Event} from "./event";
import {ProjectUpdateEventType} from "./event_type/production/project.update.eventtype";
import {Company, CompanyFinancials} from "./company";
import {EventGenerator} from "./event.generator";
import {FinanceStats} from "./company/departments/finance/stats";
import {ProductionStats} from "./company/departments/production/stats";
import {U} from "../common/u"
import { Alert, AlertType } from "./alerts";
import { Log, LogLevel } from "../core/utils/log";

export class GameManager {
    private _finStats: {[key:string]:FinanceStats} = {};
    private _prodStats: {[key:string]:ProductionStats} = {};
    private _initialized:boolean = false;
    get ready() {
        return this._initialized;
    }
    constructor(private _game:Game) {this._init();}

    /**
     *
     * @returns {Promise<boolean>}
     * @private
     */
    protected _init(): Promise<boolean> {
        let ga:GameActivity = new GameActivity(this._game.creator._id || this._game.creator, this._game._id);
        Log.log("GAME MANAGER INIT ~ GA:{g:" + ga.gameId + ', u:' + ga.userId +'}', LogLevel.Debug);
        return new Company(ga).findAll()
            .then((cs:Company[]) => Promise.all(
                cs.map((c:Company) => {
                    Log.log('FINSTATS, PRODSTATS ~  CID:' + c._id, LogLevel.Debug);
                    this._finStats[c._id.toString()] = new FinanceStats(c);
                    this._prodStats[c._id.toString()] = new ProductionStats(c);
                    return Promise.all([
                        this._finStats[c._id].init(),
                        this._prodStats[c._id].init()
                    ]);
                })
            ))
            .then(() => this._initialized = true);
    }

    /**
     * Process game updates for the next period of time
     *
     * @param ga
     * @param periodSeconds
     * @returns {any}
     */
    async play(ga:GameActivity, periodSeconds:number = 0):Promise<Event[]> {
        let cw = (done:Function) => {
            return this.ready ? done() : setTimeout(() => cw(done), 100);
        };
        await new Promise(cw);
        let ev:Event[] = [],
            simulationDate:Date = new Date(this._game.simulationDate);
        if (ga.gameId != this._game._id)
            return Promise.reject('Wrong game');

        periodSeconds = periodSeconds || this._game.options.speed * 3600;
        simulationDate = new Date(simulationDate.getTime() + periodSeconds*1000);

        Log.log("GAME START:\t" + this._game.startDate.toISOString() +'\t\tGAME SIMULATION:\t'+ this._game.simulationDate.toISOString() + ' -> ' + simulationDate.toISOString(), LogLevel.Debug);
        return (new EventGenerator(this._game)).generateAll(simulationDate)
            .then((_eev:Event[]) => ev = ev.concat(_eev))
            .then(() => (new Company(ga)).findAll())
            .then((companies:Company[]) => {
                return Promise.all(
                    companies.map((c: Company) => this.progressProjects(c, this._game.simulationDate, simulationDate))
                )
                    .then((_eev: Event[][]) => ev = ev.concat(..._eev))
            })
            .then(() =>
                this._game.populate({
                    simulationDate: simulationDate,
                    lastInteraction: (new Date).getTime()
                })
                .save()
            )
            .then(() => ev)
    }

    /**
     * Update projects stats (via events)
     *
     * @param company
     * @param fromDate
     * @param toDate
     * @returns {Promise<Event[]>}
     */
    progressProjects(company:Company, fromDate:Date, toDate:Date):Promise<any> {
        let secondsPassed:number = (toDate.getTime() - fromDate.getTime())/1000,
            prjEndAt = <AlertType>AlertType.getByName('ProjectEnd'),
            prod:ProductionStats = this._prodStats[company._id];
        if (!prod || !prod.isIninialized)
            throw new Error('No ProductionStats warmed-up for cid:' + company._id);

        return (new Project(company.ga))
            .findAll({company: company._id, status: ProjectStatus[ProjectStatus.Active]})
            .then((projects:any[]) => {
                Log.log("PROGRESS PROJECTS (" + projects.length + ") OF C:" + company.name + 'from ' + fromDate.toISOString() + ' till' + toDate.toISOString() + ' ~ ' + secondsPassed, LogLevel.Debug);
                return Promise.all(
                    projects.filter(p => !!p.todo).map(p =>
                        (new Position(p.ga)).findAll({project: p._id})
                            .then((poss:Position[]) => {
                                let burned = U.sum(poss.map(pos => pos.efficiency * secondsPassed)),
                                    completed = p.completed + burned;
                                return p.populate({
                                    completed: Math.min(p.todo, completed),
                                    status: p.todo < completed ? ProjectStatus.Closed : ProjectStatus.Active
                                })
                                .save()
                                .then((p) => {
                                    Log.log('Burned '+burned+' prj:' + (p.name | p._id) + ' ' + p.completed + ' out of ' + p.todo, LogLevel.Debug);
                                    if (U.en(ProjectStatus, p.status) == ProjectStatus.Closed)
                                        return prod.alertsStorage.throwKnown(prjEndAt, {
                                            details:{
                                                project:p._id
                                            }
                                        });
                                    return true;
                                });
                            })
                    )
                )
            });
    }

    /**
     *
     * @param company
     * @param date
     */
    monthEnd(company:Company, date:Date):Promise<Event[]> {
        let events:Event[] = [],
            fin:FinanceStats = this._finStats[company._id];
        if (!this.ready)
            throw new Error('Game Manager not initialized yet, strange...');
        if (!fin)
            throw new Error('Fin stats not initialized');
        return fin.companyFinancials
            .then((cfin:CompanyFinancials) => {
                let t = cfin.monthly;
                return [];
            })
    }
}

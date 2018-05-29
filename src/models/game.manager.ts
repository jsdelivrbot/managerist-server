import {Game, GameActivity} from "./game";
import {Project, ProjectStatus} from "./project";
import {Event} from "./event";
import {ProjectUpdateEventType} from "./event_type/production/project.update.eventtype";
import {Company, CompanyFinancials} from "./company";
import {EventGenerator} from "./event.generator";
import {FinanceStats} from "./company/departments/finance/stats";

export class GameManager {
    private _finStats: {[key:string]:FinanceStats} = {};
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
        console.log("GAME MANAGER INIT ~ GAAA:", this._game.creator._id || this._game.creator, this._game._id);
        return (new Company(new GameActivity(this._game.creator._id || this._game.creator, this._game._id))).findAll()
            .then((cs:Company[]) => Promise.all(
                cs.map((c:Company) => {
                    console.log('FINSTATS ~  ', c.ga);
                    this._finStats[c._id.toString()] = new FinanceStats(c);
                    return this._finStats[c._id].init();
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
        console.log('Try to play....');
        let cw = (done:Function) => {
            console.log(' Is this ready? = ' + this.ready);
            return this.ready ? done() : setTimeout(() => cw(done), 100);
        };
        await new Promise(cw);
        console.log('READY TO PLAY!!!! ....');
        let ev:Event[] = [],
            simulationDate:Date = new Date(this._game.simulationDate);
        if (ga.gameId != this._game._id)
            return Promise.reject('Wrong game');

        periodSeconds = periodSeconds || this._game.options.speed * 3600;
        simulationDate = new Date(simulationDate.getTime() + periodSeconds*1000);

        console.log("GAME START:\t" + this._game.startDate.toISOString() +'\t\tGAME SIMULATION:\t'+ this._game.simulationDate.toISOString() + ' -> ' + simulationDate.toISOString());
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
            //.catch((e:Error) => console.log('Oops', e));
    }

    /**
     * Update projects stats (via events)
     *
     * @param company
     * @param fromDate
     * @param toDate
     * @returns {Promise<Event[]>}
     */
    progressProjects(company:Company, fromDate:Date, toDate:Date):Promise<Event[]> {
        return Promise.resolve([]);
// FIXME
// TODO
/*
        console.log("PROGRESS PROJECTS OF C:" + company.name + 'from ' + fromDate.toISOString() + ' till' + toDate.toISOString());
        let ev:Event[] = [];
        return (new Project(company.ga))
            .findAll({company: company._id, status: ProjectStatus[ProjectStatus.Active]})
            .then((projects:any[]) => {
                console.log(projects.length + ' projects\n');
                return Promise.all(
                    projects.map(p =>
                        (new ProjectUpdateEventType(company.ga)).createEvent({
                            project: p,
                            startDate: fromDate,
                            endDate: toDate,
                        })
                    )
                )
            })
            .then((_ev:Event[]) => ev = ev.concat(_ev))
            .then((_ev:Event[]) =>
                Promise.all(
                    _ev.map((_e:Event) => _e.process())
                )
            )
            .then((_eev:Event[][]) => ev = ev.concat(..._eev));
*/            
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

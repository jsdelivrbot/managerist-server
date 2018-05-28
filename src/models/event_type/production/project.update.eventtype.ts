import {Event} from "../../event";
import {BaseEventType, CustomerEventType} from "../base.eventtype";
import {Project, ProjectType, ProjectStatus} from "../../project";
import {Product} from "../../product";
import {Company} from "../../company";
import {Employee} from "../../employee";
import {Position} from "../../position";
import {ProjectEndEventType} from "./project.end.eventtype";
import {ActiveRecord} from "../../../core/db/active.record";

/**
 * Class ProjectUpdateEventType
 */
export class ProjectUpdateEventType extends BaseEventType implements CustomerEventType {
    protected _period: number = 0;
    protected _probability: number = 0;

    protected _company: Company|any;
    protected _project: Project|any;
    protected _product: Product|any;
    protected _startDate: number;
    protected _endDate: number;

    get eventData(): any {
        return {
            description: this._project.name + ' of ' + this._company.name + ' has ended.',
            details: {
                project: this._project._id || this._project,
                product: this._product._id || this._product,
                startDate: this._startDate,
                endDate: this._endDate,
            }
        }
    }

    /**
     *
     * @param data
     * @returns {any}
     */
    public createEvent(data: any): Promise<Event|ActiveRecord> {
        if (!data.project)
            return Promise.reject('Project should be set.');
        this._project = data.project;

        if (!data.startDate)
            return Promise.reject('Start Date should be set.');
        if (!data.endDate)
            return Promise.reject('Start Date should be set.');


        let prjPromise:Promise<Project|ActiveRecord> = ( this._project._id
                ? (new Promise<Project>(() => this._project))
                : (new Project(this.ga)).findById(this._project)
        );
        return prjPromise
            .then((p: Project) => {
                this._startDate = data.startDate;
                this._endDate = data.endDate;
                this._project = p;
                this._product = p.product;
            })
            .then(() => new Event(this.ga)
                .populate(data)
                .populate(this.eventData)
            );
    }

    /**
     * burnout
     *
     * calculate possible progress on project for the given period
     *
     * @param e Event
     * @returns {Promise<ActiveRecord[]>}
     */
    process(e: Event|any): Promise<Event[]> {
        let events: Event[],
            ed = e.details;
        return (new Project(this.ga)).findById(e.details.project)
            .then((p: Project) => this._project = p)
            .then(() =>
                (new Position(this.ga))
                    .withRelations(['employee', 'role'])
                    .findAll({
                        project: this._project._id,
                        startDate: {$lt: e.details.endDate},
                        $or: [
                            {end_date: null},
                            {end_date: {$lt: e.details.startDate}}
                        ]
                    }).then((pos: Position[]|any[]) =>
                    (<Array<any>>pos).reduce(
                        (p: Position) => p.efficiency * Math.min(p.endDate, ed.endDate) - Math.max(p.startDate, ed.startDate),
                        0
                    )
                )
            )
            .then((done: number) => {
                if (done > this._project.todo)
                    return (new ProjectEndEventType(this.ga))
                        .createEvent({
                            project: e.details.project
                        })
                        .then((_e: Event) => events.push(_e) && events);
                // TODO ~ maybe allocate the rest

                return this._product.populate({
                    todo: this._project.todo - done
                })
                    .save()
                    .then(() => {
                        // - TODO - throw good/bad project events
                        return events;
                    });
            })
            .then(() => events);
    }
}

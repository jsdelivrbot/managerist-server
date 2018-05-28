import {Event} from './event';
import {Game, GameActivity} from "./game";
import {Company} from "./company";
import {BaseEventType, BaseEventTypeInterface} from "./event_type/base.eventtype";
import {U} from "../common/u";
import {EventType} from "./event.type";

export class EventGenerator {
    private _ga:GameActivity;
    private _game:Game;
    private _eventTypes: EventType[] = [];

    protected get eventTypes() {
        if (this._eventTypes.length)
            return Promise.resolve(this._eventTypes);
        return (new EventType()).findAll()
            .then((evt:EventType[]) => this._eventTypes = evt);
    }
    constructor(g:Game) {
        this._game = g;
        this._ga = new GameActivity(g.creator, g._id);
    }

    /**
     * Generating required events for the Game on date
     *
     * Tries to generate events for the period for all existing EventTypes
     * excluding "generics" (those that never generated automatically (actions? notifications?))
     *
     * TODO: Check mode, then wait until all players make a move (for turn-based mode)
     *
     * @param g
     * @param d
     * @returns {Promise<void>|Promise<T>|any}
     */
    generateAll(d: Date): Promise<Event[]|any> {
        return this.eventTypes
            .then(() => (new Company(this._ga)).findAll())
            .then((companies:any[]) => {
                let promises = companies.reduce((acc, company) => {
                    for (let et of this._eventTypes) {
                        console.log('CONSTRUCTOR??? : ', et.name || et);
                        let eT:BaseEventType;
                        try {
                            eT = new (<any>et).typeClass(this._ga, (<any>et));
                        } catch (e) {
                            console.log('FAILED TO CHECK/CREATE EVENT:' + e.message);
                            continue;
                        }
                        if (!eT.generic) {
                            console.log('GENERATOR: ' + eT.name + ' not generic, try to generate', d.toUTCString());
                            acc.push(this.generate(eT, {company: company._id, date: d}));
                        }
                    }
                    return acc;
                }, []);

                return Promise.all(promises)
                    .then(ev => [].concat(...ev));
            })
            .catch((e:Error) => {
                console.log('Events Generator failed', e);
                return Promise.reject('Events Generator failed');
            });
    }


    /**
     * generator
     *
     * TODO: maybe rename (i.e. generateForPeriod), it's actually the chain where only small part should be extendable, other is stable
     *
     * @param et
     * @param options
     * @returns {Promise<Event[]>}
     */
    generate(et:BaseEventType, options:{date:Date, company:any, [propName: string]: any}|any): Promise<Event[]|any[]> {
        let ev:Event[] = [];

        return et.previous(options.date, options.company)
            .then((prev:Event) => {
                let etPeriod:number = et.period,
                    throwed:Promise<any>[] = [],
                    date:Date = new Date(options.date),
                    dateTimestamp:number = date.getTime(),
                    prevDateTimestamp:number = Math.max(
                            ((prev && prev.date) || this._game.startDate).getTime(),
                            date.getTime() - etPeriod*1000
                        ),
                    prevDate:Date = new Date(prevDateTimestamp);

                console.log("CHECK FOR " + (<any>(et.constructor.name)).padEnd(25)+'\t'
                    + 'period = '  + (<any>(Math.round(etPeriod/360)/10 +' h'+ (et.probabilistic ? ' (probably)':''))).padEnd(30)+'\t'
                    + 'passed ~' + Math.floor((dateTimestamp - prevDateTimestamp)/(24 * 360000))/10
                    + 'd (' + Math.floor((dateTimestamp - prevDateTimestamp)/(360000))/10 + ' h)'
                    + ' ~ ' + date.toISOString()
                    + '\ttotal playing(simulated): ' + Math.floor((dateTimestamp - this._game.startDate.getTime())/360000)/10 + ' h');
                if (prev)
                    console.log('\t\t previous ' + prev.date.toISOString() + ' ' + prev._id);

                prevDateTimestamp+=(etPeriod*1000);
                while(prevDateTimestamp <= dateTimestamp) {
                    prevDate = new Date(prevDateTimestamp);
                    console.log("TRY THROW " + et.constructor.name
                        + ' \t period ~ ' + Math.round(etPeriod/360)/10 + ' h'
                        + '\te-date ~ ' + prevDate.toISOString());
                    throwed.push(
                        et.throw
                            .then((success:boolean) => {
                                if(success) {
                                    console.log('HOOOORAY!!!! EVENT THROWED!!!!!!!                '  + et.constructor.name);
                                    return et.createEvent({
                                        date: prevDate,
                                        company: options.company,
                                        game: this._game
                                    });
                                }
                                return null;
                            })
                            .then((_ev:Event|null) => _ev ? ev.push(_ev) : null)
                    );
                    etPeriod = et.period; // it might mutate for probabilistic
                    prevDateTimestamp+=(etPeriod*1000);
                }
                return Promise.all(throwed);
            })
            .then(() => ev)
            .catch((e:Error) => {
                console.log('GENNERRATOR >> WTF??? ' + e.message);
                return Promise.reject(e);
            });
    }
}

import {chai, assert, Storage} from "../../test.commons"
import {Managerist} from "../../../app";
import {Event} from "../../../models/event";
import {EventType} from "../../../models/event.type";
export class TestGame {
    static ticksInDay = 6;

    static makeATick = (ticksTodo, done:any) => {
        chai.request(Managerist.app.server)
            .post('/game/tick/')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
//                console.log(res.body);
                if (ticksTodo--)
                    TestGame.makeATick(ticksTodo, done);
                else
                    done(res);
            });
    };

    static checkEvent = (type:EventType, cb:(e:Event|null) => {}) => {
        console.log('~~~ do we have ' + type.name + ' ?');

        return (new Event(Storage.get('ga')))
            .find({
                type:type._id
            })
            .then((e:any) => cb(e));
    }

    /**
     *
     * @param type
     * @param maxDays
     * @param onDayPassed
     * @return {Promise<T>}
     */
    static waitDaysForEvent = (type:EventType, maxDays, onDayPassed:Function):Promise<Event> => {
        return (new Promise((resolve:any, reject:any) => {
            let ticks = 0,
                cyc = ((et:EventType) =>
                TestGame.makeATick(TestGame.ticksInDay, (res) => {
                    TestGame.checkEvent(et, (e:Event|null) => {
                        if (e) {
                            return resolve(e);
                        }
                        if (ticks > maxDays)
                            return reject('Event was not thrown withing ' + maxDays + ' days.');
                        ticks++;
                        return cyc(et);
                    })
                    .then(() => onDayPassed(res));
                }));
            cyc(type);
        }));
    }
}
import {chai, assert, Storage} from "../../test.commons"
import {Managerist} from "../../../app";
import {Event} from "../../../models/event";
import {EventType} from "../../../models/event.type";
import {Alert} from "../../../models/alerts/alert";
import {AlertType} from "../../../models/alerts/alert.type";

export class TestGame {
    static ticksInDay = 6;

    static makeATick = (ticksTodo, done:any) => {
        chai.request(Managerist.app.server)
            .post('/game/tick/')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (ticksTodo--)
                    TestGame.makeATick(ticksTodo, done);
                else
                    done(res);
            });
    };

    static checkEvent = (type:EventType, cb:(e:Event|null) => {}) => {
        return (new Event(Storage.get('ga')))
            .find({
                type:type._id
            })
            .then((e:any) => cb(e));
    }

    static checkAlert = (type:AlertType, cb:(e:Alert|null) => {}) => {
        return (new Alert(Storage.get('ga')))
            .find({
                type:type._id,
                ignored: [false, null],
                resolved: [false, null],
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

    /**
     *
     * @param type
     * @param maxDays
     * @param onDayPassed
     * @return {Promise<T>}
     */
    static waitDaysForAlert = (type:AlertType, maxDays, onDayPassed:Function):Promise<Alert> => {
        return (new Promise((resolve:any, reject:any) => {
            let ticks = 0,
                cyc = ((at:AlertType) =>
                TestGame.makeATick(TestGame.ticksInDay, (res) => {
                    TestGame.checkAlert(at, (a:Alert|null) => {
                        if (a) {
                            return resolve(a);
                        }
                        if (ticks > maxDays)
                            return reject('Alert was not thrown withing ' + maxDays + ' days.');
                        ticks++;
                        return cyc(at);
                    })
                    .then(() => onDayPassed(res));
                }));
            cyc(type);
        }));
    }
}
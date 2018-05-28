import {chai, assert, Storage} from "../test.commons"
import {Event} from "../../models";
import {TestGame} from "./utils/test.game";
import {EventType} from "../../models/event.type";
import {Managerist} from "../../app";

describe('Game, first steps (actions) test', () => {
    let normallyDays = 10,
        bearableDays = 15,
        processedDays = 0,
        newEmpET:EventType;

    it('Tick ~ 10 days -  POST', (done:Function) => {
        newEmpET = newEmpET || <EventType>(EventType.getByName('NewEmployee'));
        TestGame.waitDaysForEvent(newEmpET, bearableDays, () => processedDays++)
        .then((e:Event) => {
            console.log('\u001B[33m TEST SUCCEEDED \u001B[0m', e && e.common);
            console.log('\n\u001B[35m New Employee in a '+processedDays+'days \u001B[0m\n');
            e.should.have.property('type');
            if (e.type._id) {
                e.type.should.have.property('name');
                e.type.name.should.eq('NewEmployee');
            }
            (e.type._id || e.type).toString().should.eq(newEmpET._id.toString());
            done();
        })
        .catch((e) => {
            done(new Error(e));
        });
    })
    // Who knows. 10 days 's pretty long time, but 30s is ennormous amount of time...
    .timeout(30000);

    it('Get list of Hireable', (done:Function)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/hr/hireable')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) console.log(res.statusCode + ": ", res.body, err.message);

                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.eq(1);

                done();
            });
    });
});

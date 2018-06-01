import {chai, assert, Storage} from "../test.commons"
import {Managerist} from "../../app";
import {GameActivity} from "../../models/game";
import {Company} from "../../models/company";
import {Employee} from "../../models/employee";
import {Event} from "../../models/event";
import { Action } from "../../models/actions/action";
import { ActionType } from "../../models/actions/action.type";

describe('Employee controller basic test', () => {
    it('Current Employees check', (done)=> {
        let company =  Storage.get('Company');
        (new Employee(new GameActivity(Storage.get('userId'), Storage.get('gameId'))))
            .findAll({
                company: company._id
            })
            .then((_emps:Employee[]) => {

                _emps.should.have.length(1); // For "Startup" we have 1 employee for each cases

                Storage.set('Employees', _emps);
                done();
            });
    });
    it('Current Employees hirement events check', (done)=> {
        let hireAT = ActionType.getByName('Hire');
        Promise.all(
            Storage.get('Employees').map((_e) =>
                (new Action(new GameActivity(Storage.get('userId'), Storage.get('gameId'))))
                    .findAll({
                        'type': hireAT._id,
                        "details.employee" : _e._id
                    })
                    .then((_ev) => {
                        _ev.should.have.length(1);
                    })
            )
        )
        .then(() => done())
        .catch((e:Error) => done(new Error('Oops:' + e.message)));
    });

    xit('POST assign test', (done)=> {
                //noinspection TypeScriptUnresolvedFunction
                chai.request(Managerist.app.server)
                    .post('/employee/assign/')
                    .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
                    .end((err:any, res:any) => {

                        done();
                    });

    });
});
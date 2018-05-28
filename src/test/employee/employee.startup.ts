import {chai, assert, Storage} from "../test.commons"
import {Managerist} from "../../app";
import {GameActivity} from "../../models/game";
import {Company} from "../../models/company";
import {Employee} from "../../models/employee";
import {Event} from "../../models/event";

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
        Promise.all(
            Storage.get('Employees').map((_e) =>
                (new Event(new GameActivity(Storage.get('userId'), Storage.get('gameId'))))
                    .findAll({
                        'type.name': 'Hire',
                        "details.employee" : _e._id
                    })
                    .then((_ev) => {
                        _ev.should.have.length(1);
                    })
                    .catch((e:Error) => console.log('Oops:', e.message))
            )
        )
        .then(() => done())
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
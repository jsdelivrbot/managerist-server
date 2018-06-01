import {chai, assert, Storage} from "../../test.commons"
import {Event} from "../../../models/event";
import {TestGame} from "../utils/test.game";
import {EventType} from "../../../models/event.type";
import {Managerist} from "../../../app";
import {Company} from "../../../models/company/company";
import {Role} from "../../../models/role";
import {Employee} from "../../../models/employee";
import {AlertType} from "../../../models/alerts/alert.type";
import {Alert} from "../../../models/alerts/alert";

describe('Hire Developer (in a normal way) test', () => {
    let normallyDays = 10,
        bearableDays = 15,
        processedDays = 0,
        newEmpET:EventType,
        noDevAT:AlertType,
        role:Role,
        employeeId:any;

    it('Get list of Roles', (done:Function)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/hr/role/list')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.greaterThan(1);

                done();
            });
    });
    it('Set hiring priority = Developer', (done:Function)=> {
        role = <Role>Role.getByName('Developer');
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .post('/game/hr/priority')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .send({roles: [role._id]})
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                (new Company(Storage.get('ga'))).find({
                    user: Storage.get('userId')
                })
                    .then((c:Company) => {
                        let hrd = c.hrDepartment;
                        c.hrDepartment.priority.should.be.a('array');
                        c.hrDepartment.priority[0].should.eq(role._id.toString());
                        done()
                    })
                    .catch(e => done(new Error(e)));
            });
    });

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
                e.should.have.property('details');
                e.details.should.have.property('employee');
                employeeId = e.details.employee;
                console.log('EID = ' + employeeId);
                e.details.should.have.property('role');
                e.details.role.toString().should.eq(role._id.toString());

                done();
            })
            .catch((e) => {
                done(new Error(e));
            });
    })
    // Who knows. 10 days 's pretty long time, but 30s is ennormous amount of time...
        .timeout(30000);

    it('Get list of Hireable, check that new Employee in the list', (done:Function)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/hr/hireable')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.greaterThan(0);

                let available = res.body;
                available = available.filter((e:Employee) => e._id.toString() == employeeId.toString());
                available.length.should.eq(1);
                (available[0].role._id || available[0].role).toString().should.eq(role._id.toString());

                done();
            });
    });

    it('Hire that new Employee', (done:Function)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .post('/game/hr/hire')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .send({
                _id: employeeId
            })
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                done();
            });
    });

    it('Check that new Employee in not in the Hireable list anymore', (done:Function)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/hr/hireable')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                res.body.should.be.a('array');
                let available = res.body;
                available = available.filter((e:Employee) => e._id.toString() == employeeId.toString());
                available.length.should.eq(0);

                done();
            });
    });


    it('Get list of Developers, now we have One', (done:Function)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/production/team')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.eq(1);

                done();
            });
    });

    it('Get list of Alerts, "NoDevelopers" should be reseted', (done:Function)=> {
        noDevAT = noDevAT || <AlertType>(AlertType.getByName('NoDevelopers'));
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/production/alerts')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                res.body.should.be.a('array');
                let available = res.body;
                available = available.filter((a:Alert) => (a.type._id || a.type).toString() == noDevAT._id.toString());
                available.length.should.eq(0);

                done();
            });
    });
});

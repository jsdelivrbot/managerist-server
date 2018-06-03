import { chai, assert, Storage } from "../../test.commons"
import { Event } from "../../../models/event";
import { TestGame } from "../utils/test.game";
import { EventType } from "../../../models/event.type";
import { Managerist } from "../../../app";
import { Company } from "../../../models/company/company";
import { Role } from "../../../models/role";
import { Employee } from "../../../models/employee";
import { AlertType } from "../../../models/alerts/alert.type";
import { Alert } from "../../../models/alerts/alert";
import { HrAgencyPackage, HrAgencyActionType } from "../../../models/actions";
import { U } from "../../../common/u";

describe('Hire developer with help of HrAgency test', () => {
    let noDevAT:AlertType,
        role:Role,
        employeeId:any,
        funds:number = 0;

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

    it('GET current Financials', (done)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/company/financials/')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                let current = Storage.get('Company');
                res.should.have.status(200);
                res.body.should.have.property('funds');
                res.body.funds.should.greaterThan(0);
                funds = res.body.funds;
                done();
            });

    });

    it('Pay HrAgency for Developer to find', (done:Function)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .post('/game/hr/agency')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .send({package: U.e(HrAgencyPackage, HrAgencyPackage.Vip)})

            .end((err:any, res:any) => {
                if (err) return done(new Error(err));
                res.should.have.status(200);
                done();
            });
    });

    it('GET Financials, check that charged correctly', (done)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/company/financials/')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                let current = Storage.get('Company');
                res.should.have.status(200);
                res.body.should.have.property('funds');
                res.body.funds.should.greaterThan(0);
                let diff = funds - res.body.funds,
                    price = HrAgencyActionType.getPrice(HrAgencyPackage.Vip);
                diff.should.eq(price);
                done();
            });
    });

    it('Get list of Hireable, check that new Developer in the list', (done:Function)=> {
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
                available = available.filter((e:Employee) => 
                    (e.role._id || e.role).toString() == role._id.toString()
                );
                available.length.should.eq(1);
                employeeId = available[0]._id;
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

    it('Reset hiring priority (to keep process going on its own)', (done:Function)=> {
        role = <Role>Role.getByName('Developer');
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .post('/game/hr/priority')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .send({roles: []})
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                (new Company(Storage.get('ga'))).find({
                    user: Storage.get('userId')
                })
                    .then((c:Company) => {
                        let hrd = c.hrDepartment;
                        c.hrDepartment.priority.should.be.a('array');
                        c.hrDepartment.priority.length.should.eq(0);
                        done()
                    })
                    .catch(e => done(new Error(e)));
            });
    });
});
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

    it('Get list of Developers, now we have One', (done:Function)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/production/team')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.greaterThan(0, 'There ae no Developers.');
                employeeId = res.body[0]._id;
                done();
            });
    });
    
    it('Set Production Head', (done:Function)=> {
        chai.request(Managerist.app.server)
            .post('/game/production/head')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .send({employee: employeeId})
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200, res.body);
                (new Company(Storage.get('ga'))).find({
                    user: Storage.get('userId')
                })
                    .then((c:Company) => {
                        let dep = c.productionDepartment;
                        dep.head.toString().should.eq(employeeId);
                        done()
                    })
                    .catch(e => done(new Error(e)));
            });
    });
    it('Get Production Head', (done:Function)=> {
        chai.request(Managerist.app.server)
            .get('/game/production/head')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200, res.body);
                res.body.should.have.property('_id', employeeId, 'Get head (' + res.body._id + ') != (' + employeeId + ') to what was set');
                done();
            });
    });    
});

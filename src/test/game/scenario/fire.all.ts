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

describe('Fire all employees test', () => {
    let employees:any[];

    xit('Get list of All Employees we have', (done:Function)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/hr/employees')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) done(new Error(err));

                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.greaterThan(0);
                employees = res.body;
                done();
            });
    });

    xit('Fire all', (done:Function)=> {
        Promise.all(
            employees.map(emp => 
                new Promise((resolve, reject) =>{
                    chai.request(Managerist.app.server)
                    .post('/game/hr/fire')
                    .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
                    .send({employee:emp._id})
                    .end((err:any, res:any) => {
                        if (err) throw new Error(err);
                        res.should.have.status(200);
                        resolve();
                    });
                })
            )
        )
        .then(() => done())
        .catch(e => done(new Error(e)))
        //noinspection TypeScriptUnresolvedFunction
    });

    xit('Ensure that we have no Employees', (done:Function)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/hr/employees')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) done(new Error(err));

                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.eq(0);
                done();
            });
    });    
});

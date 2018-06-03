import {chai, assert, Storage} from "../../test.commons"
import {Managerist} from "../../../app";
import {AlertType} from "../../../models/alerts/alert.type";
import {Alert} from "../../../models/alerts/alert";
import {EventType} from "../../../models/event.type";
import {Event} from "../../../models/event";
import {TestGame} from "../utils/test.game"
import { Project, ProjectStatus, ProductStage, Product } from "../../../models";
import { U } from "../../../common/u";

describe('Game, first steps (actions) test', () => {
    let team:any[],
        project:any,
        prjEndAT:AlertType,
        processedDays = 0,
        x = 0;

    it('Get list of Projects', (done:Function)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/production/project/list')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eq(1);
                project = res.body[0];
                x = project.todo/(3600*24);
                x.should.be.greaterThan(1);
                if (x > 10) {
                    console.log('\n\n Project Extimated with '+x+' days, reduce it to 5 for test. \n\n\n');
                    (new Project(Storage.get('ga'))).findById(project._id)
                        .then(p => p.populate({todo: 120*3600}).save())
                        .then(() => done())
                } else 
                    done();
            });
    });

    it('Burnout **Project : Tick ~ X (2X in worst case) days -  POST', (done:Function) => {
        prjEndAT = prjEndAT || <AlertType>(AlertType.getByName('ProjectEnd'));
        TestGame.waitDaysForAlert(prjEndAT, 2*x, () => processedDays++)
            .then((a:Alert) => {
                console.log('\u001B[33m TEST SUCCEEDED \u001B[0m', a && a.common);
                console.log('\n\u001B[35m Project Ended in a '+processedDays+' days \u001B[0m\n');
                a.should.have.property('type');
                if (a.type._id) {
                    a.type.should.have.property('name');
                    a.type.name.should.eq('ProjectEnd');
                }
                (a.type._id || a.type).toString().should.eq(prjEndAT._id.toString());
                a.should.have.property('details');
                a.details.should.have.property('project');
                console.log('PID = ' + a.details.project);
                a.details.project.toString().should.eq(project._id);
                done();
            })
            .catch(e => done(new Error(e)));
    })
    // Who knows. x days 's pretty long time, but 60s is ennormous amount of time...
        .timeout(30000);

    it('Check Project states after the project completition', (done:Function) => {
        (new Project(Storage.get('ga')))/*.withRelations(['product'])*/.findById(project._id)
            .then((p:Project) => {
                U.en(ProjectStatus, p.status).should.eq(ProjectStatus.Closed);
            })
            .then(() => done())
            .catch(e => done(new Error(e)))
    });

    it('Check Product states after the project completition', (done:Function) => {
        (new Product(Storage.get('ga'))).findById(project.product)
            .then((p:Product) => {
                p.should.have.property('stage');
                U.en(ProductStage, p.stage).should.eq(ProductStage.Alpha);
            })
            .then(() => done())
            .catch(e => done(new Error(e)))
    });
    
    xit('Check Marketings for Product after it\'s launch.', (done:Function) => {
        //TODO
    });

    xit('Check Finance for Product after it\'s launch.', (done:Function) => {
        //TODO
    });
});

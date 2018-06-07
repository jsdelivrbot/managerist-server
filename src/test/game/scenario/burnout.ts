import {chai, assert, Storage} from "../../test.commons"
import {Managerist} from "../../../app";
import {AlertType} from "../../../models/alerts/alert.type";
import {Alert} from "../../../models/alerts/alert";
import {EventType} from "../../../models/event.type";
import {Event} from "../../../models/event";
import {TestGame} from "../utils/test.game"
import { Project, ProjectStatus, ProductStage, Product } from "../../../models";
import { U } from "../../../common/u";
import { Audience } from "../../../models/audience";

describe('Game, first steps (actions) test', () => {
    let team:any[],
        project:any,
        product:Product,
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

    it('Check that project now will have a progress with each Tick', (done) => {
        TestGame.makeATick(1, () => {
            (new Project(Storage.get('ga')))/*.withRelations(['product'])*/.findById(project._id)
            .then((p:Project) => {
                p.completed.should.greaterThan(0, 'Project make no progress');
                let fuatueresBurned = U.sumo(p.features, 'completed');
                fuatueresBurned.should.greaterThan(1, 'Features not burned out with project.');
                Math.abs(fuatueresBurned - p.completed).should.lessThan(1, 
                    'Summ Features burned('+fuatueresBurned+') discrepancy with project (' + p.completed +').'
                );
            })
            .then(() => done())
            .catch(e => done(new Error(e)))            
        })
    })

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
                p.isCompleted.should.eq(true, 
                    'Project should be in completed state (Resolved, Closed) but it\'s "'+U.e(ProjectStatus, p.status)+'".'
                );
            })
            .then(() => done())
            .catch(e => done(new Error(e)))
    });

    it('Check Product states after the project completition', (done:Function) => {
        (new Product(Storage.get('ga'))).findById(project.product)
            .then((p:Product) => {
                p.should.have.property('stage');
                p.isRun.should.eq(true, 'Product should be launched');
                product = p;
            })
            .then(() => done())
            .catch(e => done(new Error(e)))
    });
    
    it('Check Marketings: Audiences have non-zero conversion rate (on next Tick).', (done:Function) => {
        TestGame.makeATick(1, () => {
            (new Audience(Storage.get('ga'))).findAll({product: product._id})
            .then((a:Audience[]) => {
                a.length.should.greaterThan(0, 'Audiences should actually exists');
                let ttlConversion = U.sumo(a, 'conversion');
                ttlConversion.should.greaterThan(0, 'Audiences should have non-zero(even if really close to it) conversion rate.');
            })
            .then(() => done())
            .catch(e => done(new Error(e)))            
        })
    });

    xit('Check Finance for Product after it\'s launch.', (done:Function) => {
        //TODO
    });
});

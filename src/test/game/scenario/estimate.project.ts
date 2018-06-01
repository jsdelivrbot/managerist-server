import {chai, assert, Storage} from "../../test.commons"
import {Managerist} from "../../../app";
import {AlertType} from "../../../models/alerts/alert.type";
import {Alert} from "../../../models/alerts/alert";

describe('Game, first steps (actions) test', () => {
    let team:any[],
        projects:any[],
        notEstPrjAT:AlertType;

    it('Get list of Projects', (done:Function)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/production/project/list')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.greaterThan(0);
                projects = res.body;
                done();
            });
    });

    it('Get list of Developers', (done:Function)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/production/team')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.greaterThan(0);

                team = res.body;
                done();
            });
    });

    it('Get list of Alerts, "NotEstimatedProject" should be there', (done:Function)=> {
        notEstPrjAT = notEstPrjAT || <AlertType>(AlertType.getByName('NotEstimatedProject'));
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/production/alerts')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                res.body.should.be.a('array');
                let available = res.body;
                available = available.filter((a:Alert) => (a.type._id || a.type).toString() == notEstPrjAT._id.toString());
                available.length.should.eq(1);

                done();
            });
    });

    it('Estimate projects', (done:Function)=> {
        Promise.all(projects.map(project =>
            new Promise((resolve) =>
                chai.request(Managerist.app.server)
                    .post('/game/production/project/estimate')
                    .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
                    .send({
                        project: project._id,
                        employee: team[0]._id
                    })
                    .end((err:any, res:any) => {
                        if (err) return done(new Error(err));

                        res.should.have.status(200);
                        resolve(true);
                    })
            )
        ))
        .then(() => done())
        .catch(e => done(new Error(e)))

    });

    it('Get list of Alerts, "NotEstimatedProject" should be reseted', (done:Function)=> {
        notEstPrjAT = notEstPrjAT || <AlertType>(AlertType.getByName('NotEstimatedProject'));
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/production/alerts')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                res.body.should.be.a('array');
                let available = res.body;
                available = available.filter((a:Alert) => (a.type._id || a.type).toString() == notEstPrjAT._id.toString());
                available.length.should.eq(0);

                done();
            });
    });
});

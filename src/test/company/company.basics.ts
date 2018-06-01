import {chai, assert, Storage} from "../test.commons";
import {Managerist} from "../../app";
import {GameActivity} from "../../models/game";
import {Company} from "../../models/company";

describe('Company controller basic test', () => {
    it('GET current Companies list test', (done)=> {
        (new Company(new GameActivity(Storage.get('userId'), Storage.get('gameId'))))
            .getCurrent()
            .then((_current:Company[]) => {
                _current.should.have.length(1);
                Storage.set('Company', _current[0]);
                done();
            });
    });
    it('GET current Financials test', (done)=> {
                //noinspection TypeScriptUnresolvedFunction
                chai.request(Managerist.app.server)
                    .get('/company/financials/')
                    .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
                    .end((err:any, res:any) => {
                        if (err) return done(new Error(err));

                        let current = Storage.get('Company');
                        res.should.have.status(200);
                        res.body.funds.should.eq(current.funds);

                        done();
                    });

    });
});
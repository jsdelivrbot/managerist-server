import {chai, assert, Storage} from "../test.commons"
import {Managerist} from "../../app";
import {GameStarterBonus, GameDifficulty, GameActivity} from "../../models/game";
import {CompanySize} from "../../models/company";
import {Token} from "../../models/token";
import {GameSetup} from "../../models/game.factory";

describe('Game create test', () => {
    it('Forbid Game create POST for non-authorized', (done)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .post('/game/create')
            .send(
                (new GameSetup(
                    GameStarterBonus.Angel,
                    'Some Co.',
                    GameDifficulty.Dumb,
                    CompanySize.Startup
                )).get()
            )
            .end((err:any, res:any) => {
                res.should.have.status(401);
                done();
            });
    });

    require('./setup/variations')
    it('Game create POST', (done)=> {
        let setupData = (new GameSetup(
            GameStarterBonus.Angel,
            'Some Co.',
            GameDifficulty.Dumb,
            CompanySize.Startup
        )).get();

        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .post('/game/create')
            .set('Authorization', 'Bearer ' + Storage.get('userToken'))
            .send(setupData)
            .end((err:any, res:any) => {
                if (err) console.log(res.statusCode + ": ", res.body);

                res.should.have.status(200);
                res.body.should.have.property('token');
                let token = res.body.token;
                token.should.be.a('string');

                Storage.set('gameToken', token);
                done();
            });
    });

    it('Ensure that  Game-Token stored for further tests', (done) => {
        let ut = Storage.get('gameToken');
        ut.should.have.lengthOf.above(0);
        let payload:any = Token.verifyJwt(ut);
        payload.should.have.property('gameId');
        Storage.set('gameId', payload.gameId);
        Storage.set('ga', new GameActivity(Storage.get('userId'), Storage.get('gameId')));
        done();
    });

    it('GET Games list', (done)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/list')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err)
                    console.log(res.statusCode + ": ", res.body);

                res.should.have.status(200);
                res.body.should.have.length(1);

                done();
            });
    });
});
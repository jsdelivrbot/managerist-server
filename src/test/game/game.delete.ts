import {chai, assert, Storage} from "../test.commons"
import {Managerist} from "../../app";
import {GameStarterBonus, GameDifficulty, GameActivity} from "../../models/game";
import {CompanySize} from "../../models/company";
import {Token} from "../../models/token";

describe('Game delete test', () => {
    it('Delete Game test', (done)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .post('/game/delete')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .send({
                id: Storage.get('gameId')
            })
            .end((err:any, res:any) => {
                res.should.have.status(200);
                done(new Error(err));
            });
    });
});

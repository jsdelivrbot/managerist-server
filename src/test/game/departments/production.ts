import {chai, assert, Storage} from "../../test.commons"

import {Managerist} from "../../../app";
import {Alert} from "../../../models/alerts/alert";
import {AlertType} from "../../../models/alerts/alert.type";

describe('Game, Production, check initial state', () => {
    let noDevAT:AlertType;
    it('Get list of Developers', (done:Function)=> {
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/production/team')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) console.log(res.statusCode + ": ", res.body, err.message);

                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.eq(0);

                done();
            });
    });

    it('Get list of Alerts', (done:Function)=> {
        noDevAT = noDevAT || <AlertType>(AlertType.getByName('NoDevelopers'));
        //noinspection TypeScriptUnresolvedFunction
        chai.request(Managerist.app.server)
            .get('/game/production/alerts')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) console.log(res.statusCode + ": ", res.body, err.message);

                res.should.have.status(200);
                res.body.should.be.a('array');
                let available = res.body;
                console.log(available);
                available = available.filter((a:Alert) => {
                    console.log((a.type._id || a.type).toString() +' == '+noDevAT._id.toString());
                    return (a.type._id || a.type).toString() == noDevAT._id.toString()
                });
                available.length.should.eq(1);

                done();
            });
    });

});

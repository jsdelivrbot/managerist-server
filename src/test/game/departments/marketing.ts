import {chai, assert, Storage} from "../../test.commons"

import {Managerist} from "../../../app";
import {Alert} from "../../../models/alerts/alert";
import {AlertType} from "../../../models/alerts/alert.type";

describe('Game, Marketing, check initial state', () => {
    let noSalesAT:AlertType;
    it('Get list of Sales', (done:Function)=> {
        chai.request(Managerist.app.server)
            .get('/game/production/team')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(res.statusCode + ": ", res.body, err.message);

                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.eq(0);

                done();
            });
    });

    xit('Get list of Alerts', (done:Function)=> {
        noSalesAT = noSalesAT || <AlertType>(AlertType.getByName('NoSalesman'));

        chai.request(Managerist.app.server)
            .get('/game/production/alerts')
            .set('Authorization', 'Bearer ' + Storage.get('gameToken'))
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                res.body.should.be.a('array');
                let available = res.body;

                available = available.filter((a:Alert) => 
                    (a.type._id || a.type).toString() == noSalesAT._id.toString()
                );
                available.length.should.eq(1);

                done();
            });
    });

});

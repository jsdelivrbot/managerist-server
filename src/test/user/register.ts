import {chai, assert, Storage} from "../test.commons"
import {Managerist} from "../../app";
import {Token} from "../../models/token";


describe('User register', () => {
    it('POST auth/register should return token', (done)=> {
        chai.request(Managerist.app.server)
            .post('/auth/register')
            .send({
                name: 'no-matter',
                uuid: (new Date()).getTime() // should be only user in DB, so no matter
            })
            .end((err:any, res:any) => {
                if (err) return done(new Error(err));

                res.should.have.status(200);
                res.body.should.have.property('token');
                let token = res.body.token;
                token.should.be.a('string');

                Storage.set('userToken', token);
                done();
            });
    });

    it('Ensure that  User-Token stored for further tests', (done) => {
        let ut = Storage.get('userToken');
        ut.should.have.lengthOf.above(0);
        let payload:any = Token.verifyJwt(ut);
        payload.should.have.property('_id');
        Storage.set('userId', payload._id);
        done();
    });
});

import * as fs from "fs";
import * as crypto from "crypto";
import {ActiveRecord, SchemaTypes} from "../core/db/active.record";
import {UserCommon} from "./user";
import {Mean} from "../core/mean";
import { Log } from "../core/utils/log";

export enum TokenType {Auth, Game, Invite};
export class Token extends ActiveRecord {
    protected static _defaultAuthTtl = 600; //10 min
    protected static _defaultGameTtl = 6000; //1h 40 min  ~ after this period player will need to select game again

    /**
     *  Create Token for Auth or for the Game designation (in this case gameId added to the users data)
     *
     * @param data
     * @param type
     * @returns {string}
     */
    static createJwt(data:UserCommon|any, type:TokenType = TokenType.Auth):string {
        let alg, header, payload;
        if ([TokenType.Auth, TokenType.Game].indexOf(type) !== -1) {

            if (TokenType.Game == type && !data.gameId)
                throw 'gameId should be provided for the Game-token';

            alg = Mean.config.auth.providers.jwt.algorithm;
            header = {alg: alg, typ: "JWT", subtype: TokenType[type]};
            payload = Object.assign({
                iss: "FunkyMonkey",
                sub: "Auth for Managerist",
                aud: data._id || "unknown",
                exp: (new Date()).getTime() + (
                    type == TokenType.Auth
                        ? Token._defaultAuthTtl
                        : Token._defaultGameTtl
                )
            }, data);

            let privateKey:string|any = fs.readFileSync(Mean.config.auth.providers.jwt.privateKey, "utf8"),
                signer:any = crypto.createSign(alg);
            if (!privateKey)
                throw 'Private key doesnt exists or not accessible.';

            let str = (new Buffer(JSON.stringify(header))).toString('base64')
              + '.' + (new Buffer(JSON.stringify(payload))).toString('base64');

            signer.write(str);
            signer.end();

            let signature = (new Buffer(signer.sign(privateKey))).toString('base64');

            Log.log(TokenType[type] + '-Token was provided: u=' + payload._id + (payload.gameId ? (' g=' + payload.gameId) : ''));

            return str + '.' + signature;
        }
        throw 'Only Auth Jwt allowed so far';
    }

    static decryptPassword(pwd: string) {
        let privateKey:any = fs.readFileSync(Mean.config.auth.providers.jwt.privateKey, "utf8");
        return  crypto.privateDecrypt(privateKey, Buffer.from(pwd, 'base64'))
            .toString('base64');
    }

    static verifyJwt(token:string) {
        let blocks:string[] = token.split('.'),
            header:any = Buffer.from(blocks[0], 'base64').toString(),
            alg:string = Mean.config.auth.providers.jwt.algorithm,
            publicKey:any = fs.readFileSync(Mean.config.auth.providers.jwt.publicKey, "utf8");

        if (!blocks || blocks.length < 3)
            throw 'Not a token';
        try {
            header = JSON.parse(header);
        } catch(e) {
            throw 'Token have a wrong header';
        }

        if ([TokenType[TokenType.Auth], TokenType[TokenType.Game]].indexOf(header.subtype) == -1)
            throw 'Only Auth&Game Jwt allowed so far';

        let verifier:any = crypto.createVerify(alg);
        verifier.update(blocks[0] + '.' + blocks[1]);
        if (verifier.verify(publicKey, Buffer.from(blocks[2], 'base64'))) {
            let r = Buffer.from(blocks[1], 'base64').toString();
            try {
                r = JSON.parse(r);
            } catch (e) {
                throw 'Broken token'
            }
            return r;
        }

        return false;
    }

    protected _connection:string = 'main';
    protected _schema:any = {
        data : SchemaTypes.Mixed
    };

    public setProviderData(provider:string, data:any): Promise<any> {
        let providers = (<any>this).providers || {};
        providers[provider] = data;
        (<any>this).providers = providers;

        return this.save();
    }

    protected _common:any = class {
        _id: any;
        user:UserCommon = new UserCommon();
        token: string = '';
        ttl: number = Token._defaultAuthTtl;
        createdDate: number = (new Date()).getTime();
        data: any;
    };
}

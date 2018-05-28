import * as passport from "passport"
import {Mean} from "../core/mean";
import {UserType, User} from "./user";
import {U} from "../common/u";
import {Token} from "./token";

var GithubStrategy = require("passport-github2"),
    LinkedinStrategy = require("passport-linkedin"),
    FacebookStrategy = require("passport-facebook");

export class UserIdentity {
    private static _providers = {
        plain: {},
        jwt:{},
        github: GithubStrategy.Strategy,
        linkedin: LinkedinStrategy.Strategy,
        facebook: FacebookStrategy.Strategy
    };
    private _autocreate:boolean = true;
    private _providerName:string;
    private _provider:any;
    private _config:any;

    /**
     * Check if request contains user-auth(game) token
     *
     * @param req
     * @returns {any} UserId or NULL
     */
    static checkBearer(req:any): any {
        let token:string = req.get('Authorization');
        if (!token || token.indexOf('Bearer') == -1) return null;
        token = token.substr('Bearer '.length);
        try {
            let payload = Token.verifyJwt(token);
            return payload || null;
        } catch (e) {
            return null;
        }
    }

    constructor(provider: string, autocreate:boolean = true) {
        this._autocreate = autocreate;
        this._providerName = provider;
        this._provider = (<any>UserIdentity._providers)[provider];
        if (!this._provider)
            throw('Provider not supported.');

        this._config = Mean.config.auth.providers[this._providerName];
        if (!this._config)
            throw('Provider not setup yet, please try later.');
console.log('Identify via ~ ' + this._providerName);
        if (this._config.passport) {
            console.log('PASSPORT ~ ');
            passport.use(new this._provider(
                this._config,
                (accessToken:any, refreshToken:any, data:any, done:any) => {
                    return (new User).find(this.getProviderIdCond(data))
                        .then((u: any) => {
                            if (!(u && u._id) && this._autocreate)
                                return (new User).populate(this.getUserFromProviderData(data), true).save();

                            if (!(u && u._id)) throw('User not found.');

                            u.providers = u.providers || {};
                            u.providers[this._providerName] = data;

                            return u.update();
                        })
                        .then((u: any) => {
                            done(null, u);
                            return u;
                        })
                        .catch((e) => console.log('Error in UserIdentity:', e));
                }
            ));

            passport.serializeUser(this.serializeUser);
            passport.deserializeUser(this.deserializeUser);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param callback
     * @returns {any}
     */
    public authenticate(req:any, res:any, callback: any = null) {
        console.log(this._providerName);
        if ('jwt' == this._providerName) {
            let token:string = req.get('Authorization');
            token = token.substr('Bearer '.length);
            try {
                let payload = Token.verifyJwt(token);
                return (callback || (()=> {}))(payload ? null : ['Verification Failed'], payload);
            } catch (e) {
                return (callback || (()=> {}))(e || ['Verification Failed'], null);
            }
        }

        if ('plain' == this._providerName) {
            console.log('PWD: ',req.query.password || req.body.password);
            let password = req.query.password || req.body.password;
            if (!password)
                return (callback || (()=> {}))(['Password not provided'], null)

            if (password.length > 100) {
                try {
                    password = Token.decryptPassword(password);
                } catch (e) {
                    return (callback || (()=> {}))(['Authentication Failed (compromised)'], null);
                }
            } else {
                if (!this._config.allowPlainPassword)
                    return (callback || (()=> {}))(['Password posted without encryption'], null)
            }
            console.log('SEARCH', {
                username: req.query.username || req.body.username,
                password: password,
            });
            return (new User).find({
                username: req.query.username || req.body.username,
                password: password,
            }).then((u: any) => {
                console.log(u ? u.common : 'not-found');
                return (callback || (()=> {}))(
                    u ? null : ['Authentication Failed'],
                    u
                        ? Object.assign({token: Token.createJwt(u.common)}, u.common)
                        : null
                )
            });
        }

        if (this._config.passport) {
            let options: any = {};
            switch (this._providerName) {
                case 'github':
                    options.scope = ['user:email'];
                    break;
                case 'linkedin':

                    break;
            }
            console.log(this._config);
            return passport.authenticate(this._providerName, options, callback || (()=> {}))(req, res, () => {});
        }

        return callback ? callback(req, res) : res.status(404);
    }

    /**
     * Passport serializer
     *
     * @param user
     * @param done - callable
     */
    protected serializeUser(user:any, done:any)
    {
        console.log('Serialize ~ ', user._id || '<unknown>');
        done(null, user._id);
    }

    /**
     * Passport deserializer
     *
     * @param userId
     * @param done - callable
     */
    protected deserializeUser(userId:any, done:any)
    {
        console.log('DeSerialize ~ ', userId);
        (new User).findById(userId)
            .then((u:any) => done(null, u))
            .catch((err:any) => done(err, null))
    }

    protected getUserFromProviderData(data:any)
    {
        let u:any = {
            type: UserType.Player,
            name: U.randomName(),
            providers: {
                [this._providerName]: data
            }
        };
        switch (this._providerName) {
            case 'github':
                u.name = data.displayName;
                break;
            case 'linkedin':
                u.name = data.displayName;
                break;
            case 'facebook':
                u.name = data.displayName;
                break;
        }

        return u;
    }

    /**
     *
     * @param data
     * @returns {{}}
     */
    protected getProviderIdCond(data:any) {
        let field = 'id';
        switch (this._providerName) {
            case 'github':
                field = 'id';
                break;
        }
        console.log("PROVIDER SEARCH!!!!!", {
            ['providers.' + this._providerName + '.' + field] : data[field]
        }, data);
        return {
            ['providers.' + this._providerName + '.' + field] : data[field]
        }
    }
}
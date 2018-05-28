import {BaseController} from "../core/base.controller";
import {User} from "../models/user";
import {UserIdentity} from "../models/user.identity";
import {Token} from "../models/token";

export class AuthController extends  BaseController {
    constructor(app:any) {
        super(app, [{
                route: '/logout',
                method: 'get',
                handler: 'actionLogout'
            }, {
                route: '/whoami',
                method: 'get',
                handler: 'actionWhoami'
            }, {
                route: '/register',
                method: 'post',
                handler: 'actionRegister'
            }, {
                route: '/login/:provider',
                method: 'post',
                handler: 'actionAuth'
            }, {
                route: '/login/:provider',
                method: 'get',
                handler: 'actionAuth'
            }, {
                route: '/token',
                method: 'post',
                handler: 'actionJwt'
            }, {
                route: '/callback/:provider',
                method: 'get',
                handler: 'actionAuthCallback'
            }
        ]);
    }

    actionRegister = (req: any, res: any, next: any):any => {
        let name = req.body.name,
            uuid = req.body.uuid;

        if (!name || !uuid)
            return res.status(400).json({error: 'Name and UUID should be provided.'});

        (new User({
            name: name,
            uuid: uuid,
            type: 'mobile'
        }))
            .save()
            .then((u:any) => {
                res.json({token: Token.createJwt(u.common)});
            })
            .catch((e:Error) => {
                res.status(500).json(e.toString());
            });
    }

    actionAuth = (req: any, res: any, next: any):any => {
        console.log('someone try to auth....');
        if (req.session.currentUser) {
            return (new User).findById(req.session.currentUser)
                .then((u:any) => {
                    if (u)
                        return res.json(u.common);
                    //noinspection JSAnnotator
                    req.session.currentUser = null;
                    return this.actionAuth(req, res, next);
                })
        }
        console.log('someone not authed YET.... with=' + (req.params.provider || '<undefined>'));
        let ui = (new UserIdentity(req.params.provider));
        //noinspection JSAnnotator
        req.session.callbackUrl =
            (req.query.callback && decodeURIComponent(req.query.callback))
            || req.body.callback
            || ((req.session.history||['/']).slice().pop());

        ui.authenticate(req, res, (err:any, user:any) => {
            if (user) {
                //noinspection JSAnnotator
                req.session.currentUser = user._id;
                console.log('SESSION UPDATED', req.session);
                console.log('result:', user);
                res.json(user);
            } else
                res.status(401).json(err || 'Authentication failed');
        });
    }

    actionAuthCallback = (req: any, res: any, next: any):any => {
        let ui = (new UserIdentity(req.params.provider));
        ui.authenticate(req, res, (err:any, user:any) => {
            if (user) {
                //noinspection JSAnnotator
                req.session.currentUser = user._id;

                let callbackUrl = req.session.callbackUrl;
                if (callbackUrl) {
                    callbackUrl = callbackUrl
                        + (callbackUrl.indexOf('?') == -1 ? '?' : '&')
                        + 'jwt=' + encodeURIComponent(Token.createJwt(user.common))
                    console.log("REDIRECT TO:" + callbackUrl);
                    res.redirect(callbackUrl);
                }
                else
                    res.json(user.common);
            } else
                res.status(401).json(err);

        });
    }

    actionLogout = (req: any, res: any, next: any):any => {
        //noinspection JSAnnotator
        req.session.currentUser = null;
        res.json({result: true});
    }

    actionWhoami = (req: any, res: any, next: any):any => {
        console.log('SO WHO AM I?');
        if (req.session.currentUser)
            (new User).findById(req.session.currentUser)
                .then((u:User) => res.json(u.common))
                .catch((err) => res.status(404).json(err));
        else
            res.status(401).json(null);
    }

    actionJwt = (req: any, res: any, next: any) => {
        console.log('JWT ??? !!!');
        (new UserIdentity('jwt'))
            .authenticate(req, res, (err:any, result:any) => {
                if (result) {
                    console.log(result._id);
                    (new User).findById(result._id)
                        .then((u:User) => {
                            console.log('USER REcognized: ' + u._id);
                            //noinspection JSAnnotator
                            req.session.currentUser = u._id;
                            console.log(req.session.currentUser, req.session);
                            res.json(u.common);
                        })
                        .catch((err) => res.status(401).json(err));

                } else
                    res.status(401).json(err);

            });
    }
}
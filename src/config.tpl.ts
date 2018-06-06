/**
 * Example of typical config
 * Real one should be placed in the same path, without ".tpl"-part
 *
 * Required: DB
 * Optional: Auth
 *
 * TODO - move cache conf there
 */

export  var env =  'dev';

export var server = {
    port: 9001
}

/**
 * 'console' is default even if you'll not use that param
 * avalilable: 'nop', 'console', 'file', 'YourOwnClassName implements LogDriver'
 */
export var log = {
    driver: 'console'
}

/**
 *  DB - required config
 *
 * @type {{host: string; connections: {name: string; db: string; host: string}[]}}
 */
export var db =  {
    host: 'localhost',
    gameDbPrefix: 'managerist-',
    connections: [
        {
            name: 'sandbox',
            db: 'game-pm',
            host: 'localhost:8345',
            password: '*****'
        },{
            name: 'main',
            db: 'game-pm-global',
            host: 'localhost'
        },{
            name: 'game',
            db: 'game-pm-shared',
            host: 'localhost'
        },
    ]
};

/**
 * Auth config  - Passport compliant
 *
 * TODO - basic login/password  LocalStrategy
 *
 * @type {[provider]: {clientID: string; clientSecret: string; callbackURL: string}}
 */
export var auth = {
    providers: {
        plain: {
            allowPlainPassword: true
        },
        jwt: {
            algorithm: 'RSA-SHA256',
            privateKey: __dirname + '/secured/jwtRS256.key',
            publicKey: __dirname + '/secured/jwtRS256.key.pub',
        },
        github: {
            clientID: '********',
            clientSecret: '********',
            callbackURL: "http://localhost:9001/auth/callback/github",
            passport: true
        },
        linkedin: {
            consumerKey: '********',
            consumerSecret: '********',
            callbackURL: "http://localhost:9001/auth/callback/linkedin",
            passport: true
        },
        facebook: {
            clientID: '********',
            clientSecret: '********',
            callbackURL: "http://localhost:9001/auth/callback/facebook",
            passport: true
        }
    }
};

export var security = {
    sessionSalt: 'comeup_smthng'
};
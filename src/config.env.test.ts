/**
 *  Test configs, u'r wellcome to keep em as is )
 */
export  var env =  'test';

export var server = {
    port: 9002
}

/**
 *  DB - required config
 *
 * @type {{host: string; connections: {name: string; db: string; host: string}[]}}
 */
export var db =  {
    host: 'localhost',
    gameDbPrefix: 'managerist-test-',
    connections: [
        {
            name: 'sandbox',
            db: 'managerist-test-sandbox',
            host: 'localhost'
        },{
            name: 'main',
            db: 'managerist-test-main',
            host: 'localhost'
        },{
            name: 'game',
            db: 'managerist-test-shared',
            host: 'localhost'
        },
    ]
};

/**
 * Auth config  - Passport compilant
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
            privateKey: __dirname + '/secured/jwtRS256.test.key',
            publicKey: __dirname + '/secured/jwtRS256.test.key.pub',
            algorithm: 'RSA-SHA256'
        }
    }
};

export var security = {
    sessionSalt: 'super-secret-salt-whatever'
};
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
            db: 'managerist-test-sandbox'
        },{
            name: 'main',
            db: 'managerist-test-main',
            seed: __dirname + '/../api-db'
        },{
            name: 'game',
            db: 'managerist-test-shared'
        },
    ]
};
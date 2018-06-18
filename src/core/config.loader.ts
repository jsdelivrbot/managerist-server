export class ConfigLoader {
    protected _config:any = {
        env: 'prod',
        server: {
            port: 9001
        },
        log: {
            driver: 'console'
        },
        db: {
            host: '',
            user: '',
            password: '',
            connections: [{
                name: 'main',
                host: '',
                user: '',
                password: '',
                db: '',
                seed: __dirname + '/../api-db/'
            }],
        },
        auth: {
            providers: {
                plain: {
                    allowPlainPassword: true
                },
                jwt: {
                    privateKey: __dirname + '/../secured/jwt-rs256.key',
                    publicKey: __dirname + '/../secured/jwt-rs256.key.pub',
                    algorithm: 'RSA-SHA256'
                }
            }
        },
        cache: {
            type: 'no', // 'redis', // (only Redis supported for now, but disabled by default)
            host: 'localhost',
            port: 6379
        },
        security: {
            sessionSalt: 'comeup_smthng'
        }
    };
    private _envMap:any = {
        MEAN_PORT: 'server.port',
        MEAN_LOG_DRIVER: 'log.driver',
        MEAN_DB_HOST: 'db.host',
        MEAN_DB_USER: 'db.user',
        MEAN_DB_PASSWORD: 'db.password',
        MEAN_DB_DB: 'db.connections.0.db',
        MEAN_DB_SEED: 'db.connections.0.seed',
        MEAN_JWT_KEY: 'auth.providers.jwt.privateKey',
        MEAN_JWT_KEY_PUB: 'auth.providers.jwt.publicKey',
        MEAN_SESSION_SALT: 'security.sessionSalt'
    };

    get envMap() { return this._envMap;}
    get Config() { return this._config;}
    
    constructor(protected _configFile:string = __dirname + '../config.js') {
        this.loadFromFile(_configFile);
        this.updateWithEnv();
    }

    loadFromFile(file:string) {
        let fconfig;
        try {
            fconfig = require(file);
            this._config = fconfig;
        } catch(e) {
            return false;
        }
    }

    updateWithEnv() {
        let envMap = this.envMap;
        for (let key of Object.getOwnPropertyNames(envMap)) {
            let paramAddress = envMap[key].split('.'),
                configVar = this._config,
                tailParam = paramAddress.slice(0).pop();
            for (let param of paramAddress)
                if (typeof configVar[param] == 'object')
                    configVar = configVar && configVar[param];

            
            if (process.env[key])
                configVar[tailParam] = process.env[key] || configVar[tailParam];
        }
    }
}

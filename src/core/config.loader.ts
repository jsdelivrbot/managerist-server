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
            host: 'localhost',
            user: 'admin',
            password: '',
            connections: [{
                name: 'main',
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
                    privateKey: __dirname + '/../secured/jwtRS256.gen.key',
                    publicKey: __dirname + '/../secured/jwtRS256.gen.key.pub',
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
        PORT: 'server.port',
        MEAN_PORT: 'server.port',
        MEAN_LOG_DRIVER: 'log.driver',
        MEAN_DB_HOST: 'db.host',
        MEAN_DB_ADMIN_PASSWORD: 'db.password',
        MEAN_DB_USER: 'db.connections.0.user',
        MEAN_DB_PASSWORD: 'db.connections.0.password',
        MEAN_DB_DB: 'db.connections.0.db',
        MEAN_DB_SEED: 'db.connections.0.seed',
        MEAN_JWT_KEY: 'auth.providers.jwt.privateKey',
        MEAN_JWT_KEY_PUB: 'auth.providers.jwt.publicKey',
        MEAN_SESSION_SALT: 'security.sessionSalt'
    };

    get envMap() { return this._envMap;}
    get Config() { return this._config;}
    
    /**
     * 
     * @param _configFile 
     * @param skipEnv 
     */
    constructor(protected _configFile:string = __dirname + '../config.js', skipEnv = false) {
        ConfigLoader._merge(this._config, this.defaults);
        if (!skipEnv)
            this.updateWithEnv();
        this.loadFromFile(_configFile);
    }

    /**
     * provide defaults for derived classes
     */
    get defaults() {
        return {};
    }

    loadFromFile(file:string) {
        let fconfig;
        try {
            fconfig = require(file);
            ConfigLoader._merge(this._config, fconfig);
        } catch(e) {
            return false;
        }
    }

    updateWithEnv() {
        let envMap = this.envMap;
        for (let key of Object.getOwnPropertyNames(envMap)) {
            let paramAddress = envMap[key].split('.'),
                configVar = this.Config,
                tailParam = paramAddress.slice(0).pop();
            for (let param of paramAddress)
                if (typeof configVar[param] == 'object')
                    configVar = configVar && configVar[param];

            
            if (process.env[key])
                configVar[tailParam] = process.env[key] || configVar[tailParam];
        }
    }
    public override(update) {
        this._config = ConfigLoader._merge(this._config, update);
        return this;
    }
    protected static _merge(current, update) {
        Object.keys(update||{}).forEach(function(key) {
          // if update[key] exist, and it's not a string or array,
          // we go in one level deeper
          if (current.hasOwnProperty(key) 
              && typeof current[key] === 'object'
              && !(current[key] instanceof Array)) {
            ConfigLoader._merge(current[key], update[key]);
      
          // if update[key] doesn't exist in current, or it's a string
          // or array, then assign/overwrite current[key] to update[key]
          } else {
            current[key] = update[key];
          }
        });
        return current;
    }    
}

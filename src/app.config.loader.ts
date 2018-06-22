import { ConfigLoader as BaseConfigLoader} from "./core/config.loader";

export class ConfigLoader extends BaseConfigLoader {
    private static _appConfig = {
        db: {
            gameDbPrefix: 'managerist-game-',
            connections: [{
                name: 'main',
                user: '',
                password: '',
                db: '',
                seed: __dirname + '/../api-db/'
            }],
        },
    };    
    private static _appEnvMap = {
        MANAGERIST_DB_GAME_PREFIX: 'db.gameDbPrefix'        
    };
    get envMap() { 
        let base = super.envMap,
            env = Object.assign(base, ConfigLoader._appEnvMap);

        return env;
    }
    get Config() { 
        let base = super.Config,
            config = BaseConfigLoader._merge(base, ConfigLoader._appConfig);

        /**
         *  if it's openshift (MONGODB_SERVICE_HOST, APP_ROOT ~ post build generated env, so was not used for managerist container 
         * (maybe ordering(load mongo first) will solve issue))
         **/
        if (process.env.OPENSHIFT_BUILD_NAME) {
            if (config.db)
                config.db.host = process.env.MONGODB_SERVICE_HOST + ':' + process.env.MONGODB_SERVICE_PORT;
            if (config.auth && config.auth.providers && config.auth.providers.jwt) {
                config.auth.providers.jwt.privateKey = config.auth.providers.jwt.privateKey.replace('${APP_ROOT}', process.env.APP_ROOT);
                config.auth.providers.jwt.publicKey = config.auth.providers.jwt.publicKey.replace('${APP_ROOT}', process.env.APP_ROOT);
            }
        }
        return config;
    }
}
import { ConfigLoader as BaseConfigLoader} from "./core/config.loader";
import { Log, LogLevel } from "./core/utils/log";

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
        Log.log(env, LogLevel.Error);
        return env;
    }
    get Config() { 
        Log.log(ConfigLoader._appConfig.db, LogLevel.Debug, {color:'blue'});
        let base = super.Config,
            config = ConfigLoader._merge(base, ConfigLoader._appConfig);

        Log.log(base.db, LogLevel.Debug, {color:'yellow'});
        Log.log(config.db, LogLevel.Debug, {color:'green'});
        /**
         *  if it's openshift (MONGODB_SERVICE_HOST ~ post build generated env, so was not used for managerist container 
         * (maybe ordering(load mongo first) will solve issue))
         **/
        if (process.env.OPENSHIFT_BUILD_NAME) {
            config.db.host = process.env.MONGODB_SERVICE_HOST + ':' + process.env.MONGODB_SERVICE_PORT;
            Log.log('DB HOST OVERRIDEN: ' + config.db.host, LogLevel.Warning, {color:'purple'});
        }
        return config;
    }

    private static _merge(current, update) {
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
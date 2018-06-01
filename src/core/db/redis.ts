import * as redis from 'redis';
import { Log, LogLevel } from '../utils/log';

/**
 * private static redis-client instance
 */
var __redisClient: redis.RedisClient;

/**
 * Redis Cache.
 */
export class Cache {
    constructor(config:any) {
        if (!__redisClient) {
            __redisClient = redis.createClient();
            __redisClient.on('error', (err: Error) => {
                Log.log(err, LogLevel.Error);
                __redisClient.quit();
            });
            __redisClient.on('ready', () => {
                Log.log('REDIS READY', LogLevel.Debug);
                this.init();
            });
        }

        return this;
    }

    public putSet(key:string, values:any[]) {
        __redisClient.sadd(key, ...values, redis.print);
        __redisClient.quit();
    }

    public getSet(key:string): Promise<any> {
        return new Promise((resolve, reject) => {
            __redisClient.smembers(key,
                (err: any, replies: any) => {
                    Log.log(`
                        Reply length: ${replies.length}. 
                        Reply: ${replies}.`,
                        LogLevel.Debug
                    );
                    resolve(replies);
                });

            __redisClient.quit();
        });
    }

    private init() {}
}

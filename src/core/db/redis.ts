import * as redis from 'redis';

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
                console.log('\u001B[31m' + err.message + '\u001B[0m');
                __redisClient.quit();
            });
            __redisClient.on('ready', () => {
                console.log("\u001B[33m" + 'REDIS READY' + "\u001B[0m");
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
                    console.log(`
          Reply length: ${replies.length}. 
          Reply: ${replies}.`);
                    resolve(replies);
                });

            __redisClient.quit();
        });
    }

    private init() {
        this.putSet('scientist', [
            'Eoodsger Dijkstra',
            'Dooonald Knuth',
            'Alan Turing',
            'Grace Hopper'
        ]);
    }
}

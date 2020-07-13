import * as ioredis from 'ioredis';
import { REDIS_PORT, REDIS_HOST, REDIS_PASSWORD, REDIS_FAMILY, appLogger } from '../utils';

class RedisClient {

    redis: ioredis.Redis;

    constructor() {
    }

    createInstance() {
        if (!this.redis) {
            this.connectToRedis();
        }
    }

    private connectToRedis() {
       console.log('............rrrrrrrrrrrrrrrrrrrrrr',REDIS_HOST,REDIS_PORT)
        this.redis = new ioredis({
            port: REDIS_PORT,
            host: REDIS_HOST,
            password: REDIS_PASSWORD,
            family: REDIS_FAMILY
        });

        this.redis.on('error', (err) => {
            console.log(err,REDIS_PORT, REDIS_HOST);
        })
    }

    publishMessage(channel, message): Promise<number> {
        return this.redis.publish(channel, message);
    }

}

export const redisClient = new RedisClient();
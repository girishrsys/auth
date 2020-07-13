import { FirmSession } from "../models/session.model";
import { appLogger } from "../utils";
import { redisClient } from "../redis";
import { IFirm, Firm } from "../models";
import { FirmInstanceRedis } from "../interfaces";


export class FirmRedisService {

    constructor() {

    }

    async createFirm(firmId: string, payload: FirmInstanceRedis) {
        try {
            return await redisClient.redis.hmset(`FIRM:${firmId}`, payload);
        } catch (err) {
            appLogger.error(err.message);
            return undefined;
        }
    }

    async getFirm(firmId: string) {
        try {
            return await redisClient.redis.hmget(`FIRM:${firmId}`);
        } catch (err) {
            appLogger.error(err.message);
            return undefined;
        }
    }

}


export const firmRedisService = new FirmRedisService();
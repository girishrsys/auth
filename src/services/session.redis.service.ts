import { FirmSession } from "../models/session.model";
import { appLogger } from "../utils";
import { redisClient } from "../redis";
import { FirmSessionInstanceRedis } from "../interfaces";


export class SessionRedisService {

    constructor() {

    }

    async createSession(sessionId: string, payload: FirmSessionInstanceRedis) {
        try {
            return await redisClient.redis.hmset(`SESSION:${sessionId}`, payload);
        } catch (err) {
            appLogger.error(err.message);
            return undefined;
        }
    }

    async getSessionDetail(sessionId: string, fields?: string[]): Promise<FirmSessionInstanceRedis> {
        try {
            const [status, firmId] = await redisClient.redis.hmget(`SESSION:${sessionId}`, "status", "firmId");
            return { status, firmId };
        } catch (error) {
            appLogger.error(error.message);
            return undefined;
        }
    }

    deleteSession(sessionId) {
        return redisClient.redis.del(`SESSION:${sessionId}`);
    }

}


export const sessionRedisService = new SessionRedisService();
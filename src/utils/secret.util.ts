


import { config } from "dotenv";
import * as fs from "fs";
import { appLogger } from "./app-logger.util";
import * as path from 'path';
const jwtPrivatePath = path.join(__dirname, '../../jwt.private.key');
const jwtPublicPath = path.join(__dirname, '../../jwt.public.key');
if (fs.existsSync(".env") && fs.existsSync(jwtPrivatePath) && fs.existsSync(jwtPublicPath)) {
    appLogger.info('Env file found');
    config({ path: ".env" });
} else {
    appLogger.error('Env OR JWT Private public key file not found file not found.Process Exiting')
    process.exit();
}


export const JWT_PRIVATE_KEY = fs.readFileSync(jwtPrivatePath, 'utf8');
export const JWT_PUBLIC_KEY = fs.readFileSync(jwtPublicPath, 'utf8');


export const PORT = parseInt(process.env.NODE_PORT, 10);
export const HOST = process.env.NODE_HOST;
export const ENVIRONMENT = process.env.NODE_ENV;
export const BASE_PATH = process.env.BASE_PATH;

export const MONGO_HOST = process.env.MONGO_HOST;
export const DB_NAME = process.env.DB_NAME;
export const MONGO_PORT = process.env.MONGO_PORT;
export const MONGO_USER = process.env.MONGO_USER;
export const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
export const ENC_KEY = process.env.ENC_KEY;
export const IV = process.env.IV.toString().substr(0, 16);
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT, 10);
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_FAMILY = parseInt(process.env.REDIS_FAMILY);
export const REDIS_DB = process.env.REDIS_DB;

export const KAFKA_HOST = process.env.KAFKA_HOST;
export const JWT_ENC_KEY = process.env.JWT_ENC_KEY;

export const MONGO_URI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${DB_NAME}?authMechanism=SCRAM-SHA-1`;


console.log('=====================================================');
console.log(`====================${REDIS_HOST}====================`);
console.log('=====================================================');
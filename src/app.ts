import * as cors from 'cors';
import * as http from 'http';
import * as helmet from 'helmet';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Express, Application, Request, Response, NextFunction } from 'express';
import { appAPI } from './routes/api-routes';
import * as swagger from "swagger-express-ts";
import "reflect-metadata";
import './routes/v1';
import './controllers/v1';
import { SwaggerDefinitionConstant } from "swagger-express-ts";
import { MONGO_URI, appLogger, ENVIRONMENT } from './utils';
// const PROTO_PATH = __dirname + '/../protos/helloworld.proto';
import * as grpc from 'grpc';
import * as protoLoader from '@grpc/proto-loader';
import { connect, set } from 'mongoose';
import { redisClient } from './redis';

import { kafkaProducer } from './kafka/producer/base.producer';

// const packageDefinition = protoLoader.loadSync(
//     PROTO_PATH,
//     {
//         keepCase: false,
//         longs: String,
//         enums: String,
//         defaults: true,
//         oneofs: true
//     });

// const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;


class App {

    public app: Application;
    public server: http.Server;
    count = 4;
    constructor() {

        this.app = express();
        this.server = new http.Server(this.app);
        this.connectToDatabase();
        this.initMiddlewares();
        this.defineRoutes();
        this.errorHandler();
        redisClient.createInstance();
    }

    /**
     * @method initMiddlewares
     * @description Initializes the middlewares configuration for the app
    */
    private initMiddlewares(): void {

        this.app.use(bodyParser.json()); // use the body parser middleware
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cors()); // enable the CROSS ORIGIN RESOURE SHARING mechanism
        this.app.use(helmet()); // enable HTTP protection measures

        this.app.use('/api-docs/swagger', express.static('swagger'));
        this.app.use('/api-docs/swagger/assets', express.static('node_modules/swagger-ui-dist'));
        this.app.use(swagger.express(
            {
                definition: {
                    info: {
                        title: "Auth module for E-Law Pro",
                        version: "1.0",
                    },
                    securityDefinitions: {
                        apiKeyHeader: {
                            type: SwaggerDefinitionConstant.Security.Type.API_KEY,
                            in: SwaggerDefinitionConstant.Security.In.HEADER,
                            name: "Authorization"
                        }
                    }
                }
            }
        ));

        // this.initGrpcServer();

    }
    sayHello(call, callback) {


        callback(null, { message: 'Hello Sukhdeep`s ' + call.request.name });
    }


    private connectToDatabase() {
        connect(MONGO_URI, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
            reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
            reconnectInterval: 500,
        }).then(
            () => {
                appLogger.info(`Connected to database with uri ${MONGO_URI}`);
            },
            (error) => {
                appLogger.error(`Could not connect to data base with uri ${MONGO_URI}`);
                process.exit(1);
            }
        );

        // set mongoose debug environment
        if (ENVIRONMENT !== 'production') {
            set('debug', true);
        }
    }

    // private initGrpcServer() {
    //     const server = new grpc.Server();
    //     server.addService(hello_proto.Greeter.service, { sayHello: this.sayHello });
    //     server.bind('localhost:3001', grpc.ServerCredentials.createInsecure());
    //     server.start();
    // }

    /**
     * @method defineRoutes
     * @description Defines the routing for the app
    */
    private defineRoutes(): void {

        // API Base path
        this.app.use(appAPI.path, appAPI.routerinstance);
        // fallback invalid route
        this.app.use((req: Request, res: Response, next: NextFunction) => {

            res.status(404).json({
                success: false,
                message: 'Invalid route',
                result: {},
                statusCode: 404
            });
        });
    }

    /**
     * @method errorHandler
     * @description Handles the error throughout the app
     */
    private errorHandler(): void {
        process.on('uncaughtException', (err) => {
            appLogger.error(err.message);
        });
        process.on('unhandledRejection', (err) => {
            console.error(err);
            appLogger.error('Unhandler');
        });
        process.on('exit', (err) => {
            console.error(err);
            appLogger.error('Existing');
        });
        this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            return res.status(500).json({
                statusCode: 500,
                message: 'Internal Server Error',
                success: false
            });
        });
    }
}

// export the default "App" class object "server" property
export default new App().server;
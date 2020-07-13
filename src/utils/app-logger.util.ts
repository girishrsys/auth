
import { Logger, LogEntry, createLogger, transports, format, addColors } from 'winston';
import { LogColors } from '../enums';

class AppLogger {

    private logger: Logger;

    private customLoggerLevel = {
        levels: {
            'error': 0,
            'db': 1,
            'warn': 2,
            'info': 4
        },
        colors: {
            'error': 'red',
            'db': 'orange',
            'warn': 'yellow',
            'info': 'blue'
        }
    }

    constructor() {
        this.initLogger();
    }

    /**
     * @description Initialize the winston logger for the application
     */
    private initLogger() {
        this.logger = createLogger({
            transports: [
                new transports.Console(),
                new transports.File({ filename: 'debug.log' })
            ],
            levels: this.customLoggerLevel.levels,
            format: format.combine(
                // format.colorize(),
                format.timestamp(),
                format.json()
            ),
        });

        addColors(this.customLoggerLevel.colors);
    }



    /**
     * @description This method is public and can be accessed to log
     * @param logEntry the entry that needs to be Logged
     */
    entryLog(logEntry: LogEntry) {
        this.logger.log(logEntry);
    }

    /**
     * @description If the level is very high and should be taken into account on pritority
     * @param message string
     */
    error(message: string) {
        this.entryLog({
            level: 'error',
            message
        })
    }

    /**
     * @description If the level is warning and should be focused 
     * @param message string
     */
    warning(message: string) {
        this.entryLog({
            level: 'warn',
            message
        })
    }

    /**
    * @description If the level is for info only
    * @param message string
    */
    info(message: string) {
        this.entryLog({
            level: 'info',
            message
        })
    }

    /**
   * @description If the level database error
   * @param message string
   */
    dbError(message: string) {
        this.entryLog({
            level: 'db',
            message
        })
    }

}


export const appLogger = new AppLogger();


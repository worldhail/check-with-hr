import winston from 'winston';
import 'winston-mongodb';
import 'winston-daily-rotate-file';
import 'express-async-errors';

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    // defaultMeta: { service: 'user-service' },
    transports: [
        // logs the error
        new winston.transports.DailyRotateFile({ // logs the error and request
            filename: 'logs/app.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '15d',
            level: 'info',
            zippedArchive: true
        }),

        // logs the error to the database on production mode only
        ...(isProduction ? [ 
            new winston.transports.MongoDB({
                level: 'info',
                options: { useUnifiedTopology: true },
                db: process.env.MONGODB_URI,
                collection: 'logs',
                capped: true,
                cappedMax: 500
            })
        ] : [])
    ],

    // logs only the uncaughtExceptions here
    exceptionHandlers: [
        new winston.transports.DailyRotateFile({
            filename: 'logs/exceptions.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '15d',
            level: 'info',
            zippedArchive: true
        }),

        // logs the uncaughtException to the database on production mode only 
        ...(isProduction ? [
                new winston.transports.MongoDB({
                    level: 'info',
                    db: process.env.MONGODB_URI,
                    collection: 'exception_logs',
                    capped: true,
                    cappedMax: 500
                })
        ]: []),
    ],

    // logs only the unhandledRejection here
    rejectionHandlers: [
        new winston.transports.DailyRotateFile({
            filename: 'logs/rejections.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '15d',
            level: 'info',
            zippedArchive: true
        }),

        // logs the unhandledRejection to the database on production mode only 
    ...(isProduction ? [
        new winston.transports.MongoDB({
            level: 'info',
            db: process.env.MONGODB_URI,
            collection: 'rejection_logs',
            capped: true,
            cappedMax: 500
        })
    ] : [])
    ]
});

export default logger;
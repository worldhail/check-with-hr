import winston from 'winston';
import 'winston-mongodb';
import 'winston-daily-rotate-file';
import 'express-async-errors';
import debug from 'debug';

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        // logs the error
        new winston.transports.DailyRotateFile({ // logs the error
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
    ],

    // logs the uncaughtException to the database on production mode only 
    ...(isProduction ? {
        exceptionHandlers: [
            new winston.transports.MongoDB({
                level: 'info',
                db: process.env.MONGODB_URI,
                collection: 'exception_logs',
                capped: true,
                cappedMax: 500
            })
        ]
    } : {}),

    // logs the unhandledRejection to the database on production mode only 
    ...(isProduction ? {
        rejectionHandlers: [
            new winston.transports.MongoDB({
                level: 'info',
                db: process.env.MONGODB_URI,
                collection: 'rejection_logs',
                capped: true,
                cappedMax: 500
            })
        ]
    } : {})
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    debug('Unhandled Rejection at:', promise, 'reason:', reason)
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    debug('There was an uncaught error', error)
    logger.error('Uncaught Exception thrown:', error);
    process.exit(1);
});

export default logger;
import logger from '../config/logger.js';
import debug from 'debug';

export default function (err, req, res, next) {
    const statusCode = err.statusCode ?? 500;
    const isStatusCode_500 = statusCode === 500;
    let message = 'Something went wrong. Please try again later!';

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        let errorType = 'server error';

        if (!isStatusCode_500) {
            errorType = 'client error';
            message = ''
        };

        const debugError = debug(`app:${errorType}`);
        debugError(message, err);

        message = err.message
    } 

    logger.error(err);
    res.status(statusCode).send(message);
};
import logger from '../startup/logging.js';
import debug from 'debug';

export default function (err, req, res, next) {
    const statusCode = err.statusCode ?? 500;
    const isStatusCode_500 = statusCode === 500;
    let errorType = 'client error';
    let message = '';

    if (isStatusCode_500) {
        errorType = 'server error';
        message = 'Something went wrong. Please try again later!';
    };

    const debugError = debug(`app:${errorType}`);
    debugError(message, err);

    message = err.message;
    logger.error(message);

    res.status(statusCode).send(message);
};
import logger from '../startup/logging.js';
import debug from 'debug';
const debugError = debug('app:error');

export default function (err, req, res, next) {
    debugError('Something went wrong from the server ->', err);
    logger.error(err.message);
    res.status(500).send('Something went wrong');
};
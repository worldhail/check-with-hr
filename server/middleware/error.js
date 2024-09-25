const logger = require('../startup/logging');
const debugError = require('debug')('app:error');

module.exports = function (err, req, res, next) {
    debugError('Something went wrong from the server ->', err);
    logger.error(err.message);
    res.status(500).send('Something went wrong');
};
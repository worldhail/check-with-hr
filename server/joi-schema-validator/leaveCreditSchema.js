// NPM PACKAGE
const Joi = require('joi');

// LEAVE CREDITS SCHEMA
module.exports = Joi.object({
    regularizationDate: Joi.date().iso().required(),
    used: Joi.number().optional()
});
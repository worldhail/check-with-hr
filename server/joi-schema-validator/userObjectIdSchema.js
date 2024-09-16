// NPM PACKAGE
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

// USER OBJECT ID SCHEMA
module.exports = Joi.object({
    'Employee': Joi.object({
        user: Joi.objectId().required()
    })
});
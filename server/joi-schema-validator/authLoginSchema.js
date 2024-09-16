// NPM PACKAGE
const Joi = require('joi');

// AUTHORIZATION LOGIN SCHEMA
module.exports = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().min(8).max(255).alphanum().required(),
    role: Joi.string().valid('admin', 'employee').required()
});
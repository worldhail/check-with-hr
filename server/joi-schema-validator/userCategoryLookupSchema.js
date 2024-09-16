// NPM PACKAGE
const Joi = require('joi');

// USER CATEGORY SCHEMA
module.exports = Joi.object({
    employeeID: Joi.string().alphanum().max(55).allow(''),
    firstName: Joi.string().max(55).allow('').insensitive(),
    middleName: Joi.string().max(55).allow(''),
    lastName: Joi.string().max(55).allow(''),
    department: Joi.string().max(55).allow(''),
    hireDate: Joi.date().iso().allow(''),
    employmentStatus: Joi.string().min(5).max(55).allow(''),
});
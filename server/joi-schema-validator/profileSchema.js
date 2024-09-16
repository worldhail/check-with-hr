// NPM PACKAGE
const Joi = require('joi');

// VALIDATOR FOR USER INFO MODIFICATION
module.exports = function validateUserInfo(userInfo) {
    const userSchema = Joi.object({
        employeeID: Joi.string().alphanum().min(5).max(55).required(),
        firstName: Joi.string().min(2).max(55).required(),
        middleName: Joi.string().min(2).max(55).required(),
        lastName: Joi.string().min(2).max(55).required(),
        department: Joi.string().min(5).max(55).required(),
        position: Joi.string().min(2).max(55).required(),
        hireDate: Joi.date().iso().required(),
        address: {
            street: Joi.string().min(3).max(55).required(),
            barangay: Joi.string().min(3).max(55).required(),
            city: Joi.string().min(3).max(55).required(),
            province: Joi.string().min(3).max(55).required(),
            zipCode: Joi.string().min(2).max(55).required(),
        },
        employmentStatus: Joi.string().min(5).max(55).required()
    });

    const result = userSchema.validate(userInfo, { abortEarly: false });
    return result;
};

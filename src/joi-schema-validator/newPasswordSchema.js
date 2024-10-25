// NPM PACKAGE
import Joi from 'joi';

// PASSING NEW PASSWORD FOR MODIFICATION SCHEMA
export default Joi.object({
    currentPassword: Joi.string().min(8).max(255).alphanum().required(),
    newPassword: Joi.string().min(8).max(255).alphanum().required(),
    confirmNewPassword: Joi.string().min(8).max(255).alphanum().required()
});
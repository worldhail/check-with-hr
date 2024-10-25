// NPM PACKAGE
import Joi from 'joi';

// AUTHORIZATION LOGIN SCHEMA
export default Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().min(8).max(255).alphanum().required(),
    role: Joi.string().valid('admin', 'employee').required()
});
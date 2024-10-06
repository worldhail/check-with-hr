// NPM PACKAGE
import Joi from 'joi';

// LEAVE CREDITS SCHEMA
export default Joi.object({
    regularizationDate: Joi.date().iso().required(),
    used: Joi.number().optional()
});
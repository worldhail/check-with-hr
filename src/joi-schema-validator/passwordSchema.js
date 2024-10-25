import Joi from 'joi';

export default Joi.object({ password: Joi.string().min(8).max(255).alphanum().required() });
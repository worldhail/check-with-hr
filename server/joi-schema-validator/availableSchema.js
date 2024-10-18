import Joi from 'joi';

export default Joi.object({ available: Joi.number().required() });
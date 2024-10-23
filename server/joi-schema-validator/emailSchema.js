import Joi from 'joi';

export default Joi.object({ newEmail: Joi.string().min(5).max(55).email().required() });
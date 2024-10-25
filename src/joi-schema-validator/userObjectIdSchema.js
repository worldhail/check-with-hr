// NPM PACKAGE
import Joi from 'joi';
import joiObjectid from 'joi-objectid';
Joi.objectId = joiObjectid(Joi);

// USER OBJECT ID SCHEMA
export default Joi.object({
    'Employee': Joi.object({
        user: Joi.objectId().required()
    })
});
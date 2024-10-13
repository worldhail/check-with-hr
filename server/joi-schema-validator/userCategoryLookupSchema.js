// NPM PACKAGE
import Joi from 'joi';

// USER CATEGORY SCHEMA
const stringFormat = () => Joi.string().max(55).empty('');
export default Joi.object({
    employeeID: Joi.string().alphanum().max(5).empty(''),
    firstName: stringFormat(),
    middleName: stringFormat(),
    lastName: stringFormat(),
    department: stringFormat(),
    hireDate: Joi.date().iso().allow('').empty(''),
    employmentStatus: stringFormat().min(5)
});
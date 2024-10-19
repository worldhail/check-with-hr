// NPM PACKAGE
import Joi from 'joi';

// PAYSLIP ALLOWANCE SCHEMA
export default Joi.object({
    'Allowances': Joi.object({
        'Rice Allowance': Joi.number(),
        'Laundry Allowance': Joi.number(),
        'Medical Cash Allowance': Joi.number(),
        'Uniform Allowance': Joi.number(),
        'Employee Pag-IBIG share paid by Smiles': Joi.number(),
        'Employee Philhealth share paid by Smiles': Joi.number(),
        '13th Month': Joi.number(),
        'Complexity Pay': Joi.number(),
        'Other Allowances': Joi.number()
    })
});
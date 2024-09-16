// NPM PACKAGE
const Joi = require('joi');

// PAYSLIP ALLOWANCE SCHEMA
module.exports = Joi.object({
    'Allowances': Joi.object({
        'Rice Allowance': Joi.number().default(0),
        'Laundry Allowance': Joi.number().default(0),
        'Medical Cash Allowance': Joi.number().default(0),
        'Uniform Allowance': Joi.number().default(0),
        'Employee Pag-IBIG share paid by Smiles': Joi.number().default(0),
        'Employee Philhealth share paid by Smiles': Joi.number().default(0),
        '13th Month': Joi.number().default(0),
        'Complexity Pay': Joi.number().default(0),
        'Other Allowances': Joi.number().default(0)
    })
});
// NPM PACKAGE
import Joi from 'joi';

// PAYSLIP CONTRIBUTION AND DEDUCTION SCHEMA
export default Joi.object({
    'Contributions & Deductions': Joi.object({
        'Pag-IBIG': Joi.number().default(0),
        'SSS': Joi.number().default(0),
        'Philhealth': Joi.number().default(0),
        'BIR Withholding Tax': Joi.number().default(0),
        'SSS Loan Repayment': Joi.number().default(0),
        'Pagibig Loan Repayment': Joi.number().default(0),
        'Other Deductions': Joi.number().default(0)
    })
});
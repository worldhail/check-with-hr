// NPM PACKAGE
import Joi from 'joi';

// PAYSLIP CONTRIBUTION AND DEDUCTION SCHEMA
export default Joi.object({
    'Contributions & Deductions': Joi.object({
        'Pag-IBIG': Joi.number(),
        'SSS': Joi.number(),
        'Philhealth': Joi.number(),
        'BIR Withholding Tax': Joi.number(),
        'SSS Loan Repayment': Joi.number(),
        'Pagibig Loan Repayment': Joi.number(),
        'Other Deductions': Joi.number()
    })
});
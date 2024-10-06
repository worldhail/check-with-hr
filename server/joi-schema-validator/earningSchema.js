// NPM PACKAGE
import Joi from 'joi';

// PAYSLIP EARNINGS SCHEMA
export default Joi.object({
    'Earnings': Joi.object({
        'Earnings from Hours Worked': Joi.number().default(0),
        'Performance Bonus / Attendance bonus': Joi.number().default(0),
        'Other Earnings / Relocation / Referral': Joi.number().default(0)
    })
});
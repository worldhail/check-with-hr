// NPM PACKAGE
import Joi from 'joi';

// PAYSLIP EARNINGS SCHEMA
export default Joi.object({
    'Earnings': Joi.object({
        'Earnings from Hours Worked': Joi.number(),
        'Performance Bonus / Attendance bonus': Joi.number(),
        'Other Earnings / Relocation / Referral': Joi.number()
    })
});
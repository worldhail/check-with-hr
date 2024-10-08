// NPM PACKAGE
import Joi from 'joi';

// PAYSLIP HOURLY BREAKDOWN SCHEMA
export default Joi.object({
    'Hourly Breakdown': Joi.object({
        'breakdown': Joi.array().items(Joi.object({
            'Hour Type': Joi.string(),
            'Hours': Joi.number().default(0),
            // 'Earnings': Joi.number().default(0)
        }))
    })
});
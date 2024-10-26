// NPM PACKAGES
import express from 'express';
const router = express.Router();

// CUSTOM MODULES/MIDDLEWARES
import earningSchema from '../joi-schema-validator/earningSchema.js';
import contriAndDeductSchema from '../joi-schema-validator/contriAndDeductSchema.js';
import allowanceSchema from '../joi-schema-validator/allowanceSchema.js';
import hourlyBreakdownSchema from '../joi-schema-validator/hourlyBreakdownSchema.js';
import validateObjectId from '../middleware/validateObjectId.js';
import validate from '../middleware/validate.js';
import {
    payslipTemplate,
    updateEarnings,
    updateContributionAndDeductions,
    updateAllowances,
    updateHourlyBreakdown,
} from '../controllers/payslipController.js';

// CREATING A PAYLISP TEMPLATE
router.post('/payslip-template/:id', validateObjectId(), payslipTemplate);
router.put('/payslip/earnings/:id', validateObjectId(), validate(earningSchema), updateEarnings);
router.put(
    '/payslip/contributions-and-deductions/:id',
    validateObjectId(),
    validate(contriAndDeductSchema),
    updateContributionAndDeductions
);
router.put('/payslip/allowances/:id', validateObjectId(), validate(allowanceSchema), updateAllowances);
router.put(
    '/payslip/hourly-breakdown/:id',
    validateObjectId(),
    validate(hourlyBreakdownSchema),
    updateHourlyBreakdown
);

export default router;
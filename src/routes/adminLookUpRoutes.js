// NPM PACKAGES
import express from 'express';
const router = express.Router();

// CUSTOMER MODULES/MIDDLEWARES
import validate from '../middleware/validate.js';
import userCategoryLookupSchema from '../joi-schema-validator/userCategoryLookupSchema.js';
import leaveCreditSchema from '../joi-schema-validator/leaveCreditSchema.js';
import validateObjectId from '../middleware/validateObjectId.js';
import availableSchema from '../joi-schema-validator/availableSchema.js'
import {
    userDocuments,
    createLeaveCredits,
    updateLeaveCredits
} from '../controllers/adminLookUpController.js';

// GET EMPLOYEE DOCUMENTS
router.get('/user-docs', validate(userCategoryLookupSchema), userDocuments);
router.post(
    '/user-doc/credits/set/:id',
    validateObjectId(),
    validate(leaveCreditSchema),
    createLeaveCredits
);
router.patch(
    '/user-doc/credits/update/:id',
    validateObjectId(),
    validate(availableSchema),
    updateLeaveCredits
);

export default router;
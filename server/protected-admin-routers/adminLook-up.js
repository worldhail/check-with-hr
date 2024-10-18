// NPM PACKAGES
import express from 'express';
const router = express.Router();
import Joi from 'joi';
import debug from 'debug';
const debugAdmin = debug('app:admin');

// CUSTOMER MODULES/MIDDLEWARES
import validate from '../middleware/validate.js';
import userCategoryLookupSchema from '../joi-schema-validator/userCategoryLookupSchema.js';
import leaveCreditSchema from '../joi-schema-validator/leaveCreditSchema.js';
import validateObjectId from '../middleware/validateObjectId.js';
import collate from '../services/collate.js';
import setLeaveCredits from '../services/setLeaveCredits.js';
import availableSchema from '../joi-schema-validator/availableSchema.js'
import getLeaveCredits from '../services/getLeaveCredits.js';
import calculateCreditDifference from '../services/calculateCreditDifference.js';
import updateCredits from '../services/updateCredits.js';

// GET EMPLOYEE DOCUMENTS
router.get('/user-docs', validate(userCategoryLookupSchema), async (req, res) => {
    const documents = await collate(req.body);
    debugAdmin('Matching documents returned');
    res.send(documents);
});

router.post('/user-doc/credits/set/:id', validateObjectId(), validate(leaveCreditSchema), async (req, res) => {
    const id = req.params.id;
    
    const userCredits = await setLeaveCredits(id, req.body);

    debugAdmin('New leave credits setup');
    res.status(201).send(userCredits);
});

router.patch('/user-doc/credits/update/:id', validateObjectId(), validate(availableSchema), async (req, res) => {
    const id = req.params.id;
    const numberOfLeave = req.body.available;
    
    const credits = await getLeaveCredits(id);
    if (!credits) return res.status(400).send('No user credits found');

    debugAdmin('Caculating credit difference');
    const creditDifference = calculateCreditDifference(credits, numberOfLeave);
    
    const newCredits = await updateCredits(id, creditDifference);
    debugAdmin('Leave credits updated', newCredits);
    res.send(newCredits);
});

export default router;
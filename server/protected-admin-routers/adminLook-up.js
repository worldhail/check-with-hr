// NPM PACKAGES
import express from 'express';
const router = express.Router();
import Joi from 'joi';
import debug from 'debug';
const debugAdmin = debug('app:admin');

// CUSTOMER MODULES/MIDDLEWARES
import LeaveCredits from '../models/leave-credits.js';
import validate from '../middleware/validate.js';
import userCategoryLookupSchema from '../joi-schema-validator/userCategoryLookupSchema.js';
import leaveCreditSchema from '../joi-schema-validator/leaveCreditSchema.js';
import validateObjectId from '../middleware/validateObjectId.js';
import collate from '../services/collate.js';
import setLeaveCredits from '../services/setLeaveCredits.js';

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

router.patch('/user-doc/credits/update/:id', validateObjectId(), async (req, res) => {
    const id = req.params.id;
    const availableSchema = Joi.object({ available: Joi.number().required() });
    const { error } = availableSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const credits = await LeaveCredits.findOne({ user: id });
    if (!credits) return res.status(400).send('No user credits found');
    
    let numberOfDays = req.body.available;
    let availableCredits = credits.available;
    let usedCredits = credits.used;
    if (numberOfDays > 0) {
        if (numberOfDays > usedCredits) return res.status(400).send(`Should not be greater than the used credits`);

        availableCredits += numberOfDays;
        usedCredits -= numberOfDays;
    } else {
        numberOfDays *= -1;
        if (numberOfDays > availableCredits) return res.status(400).send(`Only a maximum of ${credits.available}`);

        availableCredits -= numberOfDays;
        usedCredits += numberOfDays;
    };
    
    const newCredits = await LeaveCredits.updateOne(
        { user: id },    
        { $set: {
                used: usedCredits,
                available: availableCredits
            }
        });
    debugAdmin('Leave credits updated', newCredits);
    res.send(newCredits);
});

export default router;
// NPM PACKAGES
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const debugAdmin = require('debug')('app:admin');

// CUSTOMER MODULES/MIDDLEWARES
const User = require('../models/user');
const LeaveCredits = require('../models/leave-credits');
const userCategoryLookupSchema = require('../joi-schema-validator/userCategoryLookupSchema');
const leaveCreditSchema = require('../joi-schema-validator/leaveCreditSchema');
const validateObjectId = require('../middleware/validateObjectId');

// GET EMPLOYEE DOCUMENTS
router.get('/user-docs', async (req, res, next) => {
    // x the new input from the request body
    const { error } = userCategoryLookupSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).send(error.details[0].message);

    // try {
        const queries = [];

        // Seaches every key pairs to ensure documents are retrieved
        for (let keys in req.body) {
            if (req.body[keys] === '') return res.status(400).send('Remove or add search to all empty categories');

            queries.push(User.find({ [keys]: req.body[keys] })
                .select('employeeID firstName middleName lastName department hireDate employmentStatus')
                .collation({ locale: 'en', strength: 2 }));
        };

        if (queries.length === 0) return res.status(400).send('No search parameters setup');

        // making sure every key pair document results must not be duplicated
        const result = (await Promise.all(queries)).flat();
        const documents = Array.from(new Set(result.map(obj => obj._id.toString())))
            .map(id => result.find(obj => obj._id.toString() === id));
        
        res.send(documents);
    // } catch (error) {
    //     next(error);
    // }
});

router.post('/user-doc/credits/set/:id', validateObjectId(), async (req, res, next) => {
    const id = req.params.id;

    // try {
        const { error } = leaveCreditSchema.validate(req.body, { abortEarly: false });
        if (error) return res.status(400).send(error.details[0].message);

        const { regularizationDate, used } = req.body;
        const leaveCredits = new LeaveCredits({ user: id, regularizationDate, used });
        const userCredits = await LeaveCredits.findOne({ user: id });
        if (userCredits) await LeaveCredits.deleteOne({ user: id });
        await leaveCredits.save();
        debugAdmin('New leave credits setup');
        res.status(201).send(leaveCredits);
    // } catch (error) {
    //     next(error)
    // }
});

router.patch('/user-doc/credits/update/:id', validateObjectId(), async (req, res, next) => {
    const id = req.params.id;
    const availableSchema = Joi.object({ available: Joi.number().required() });
    const { error } = availableSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // try {
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
    // } catch (error) {
    //     next(error);
    // }
});

module.exports = router;
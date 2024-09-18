// NPM PACKAGES
const express = require('express');
const router = express.Router();
const debugAdmin = require('debug')('app:admin');

// CUSTOM MODULES/MIDDLEWARES
const { Payslip } = require('../models/payslip');
const User = require('../models/user');
const userObjectIdSchema = require('../joi-schema-validator/userObjectIdSchema');
const earningSchema = require('../joi-schema-validator/earningSchema');
const contriAndDeductSchema = require('../joi-schema-validator/contriAndDeductSchema');
const allowanceSchema = require('../joi-schema-validator/allowanceSchema');
const hourlyBreakdownSchema = require('../joi-schema-validator/hourlyBreakdownSchema');
const makeDottedKeyPairs = require('../utils/makeDottedKeyPairs');
const getTotal = require('../utils/getTotal');
const getHoursRate = require('../utils/getHoursRate');

// ROUTERS
// CREATING A PAYLISP TEMPLATE
router.post('/payslip-template/:id', async (req, res, next) => {
    const id = req.params.id;
    const { error } = userObjectIdSchema.validate({ 'Employee': { user: id }});
    if (error) return res.status(400).send(error.details.map(items => items.message));

    // try {
        const user = await User.findOne({ _id: id });
        if (!user) return res.status(400).send('Invalid ID')

        const savedPayslip = await Payslip.findOne({ 'Employee.user': id });
        if (savedPayslip) return res.send(savedPayslip);
        else {
            const payslip = new Payslip({ 'Employee.user': id });
            await payslip.save()
            res.status(201).send(payslip);
        }
    // } catch (error) {
    //     next(error);
    // }
});

// EDITTING PAYSLIP TEMPLATE FOR EARNINGS CATEGORY
router.put('/payslip/earnings/:id', async (req, res, next)=> {
    const id = req.params.id;
    
    // validate the input object and its properties
    const { error } = earningSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).send(error.details.map(items => items.message));
    
    // try {
        const earningObject = await Payslip.findOne({ 'Employee.user': id }).select('Earnings -_id');
        const earningId = earningObject['Earnings']._id;
        if (!earningObject) return res.status(400).send('Payslip not found for the user');

        // add all the property values of the Earning object
        const sum = getTotal(req.body, 'Earnings', earningObject);

        // set a dot notation on a string type for the key pairs and push the total property
        const dottedPairs = makeDottedKeyPairs(req.body, 'Earnings');
        dottedPairs.push(['Earnings.Total Earnings', sum]);

        // convert the dottenPairs array to an object and update the properties
        const newValues = Object.fromEntries(dottedPairs);
        const updateEarnings = await Payslip.updateOne({ 'Employee.user': id, 'Earnings._id': earningId }, { $set: newValues });
        debugAdmin('Earnings updated ', updateEarnings);
        res.send(updateEarnings);
    // } catch (error) {
    //     next(error);
    // }
});

// EDITTING PAYSLIP TEMPLATE FOR CONTRIBUTION AND DEDUCTION CATEGORY
router.put('/payslip/contributions-and-deductions/:id', async (req, res, next)=> {
    const id = req.params.id;
    
    // validate the input object and its properties
    const { error } = contriAndDeductSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).send(error.details.map(items => items.message));

    // try {
        const contriAndDeduct = await Payslip.findOne({ 'Employee.user': id }).select({ 'Contributions & Deductions': 1, _id: 0 });
        const contriAndDeductId = contriAndDeduct['Contributions & Deductions']._id;
        if (!contriAndDeduct) return res.status(400).send('Payslip not found for the user');

        // add all the property values of the Contributions & Deductions object
        const sum = getTotal(req.body, 'Contributions & Deductions', contriAndDeduct);

        // set a dot notation on a string type for the key pairs and push the total property
        const dottedPairs = makeDottedKeyPairs(req.body, 'Contributions & Deductions');
        dottedPairs.push(['Contributions & Deductions.Total Contributions & Deductions', sum]);

        // convert the dottenPairs array to an object and update the properties
        const newValues = Object.fromEntries(dottedPairs);
        const updateContriAndDeduct = await Payslip.updateOne({ 'Employee.user': id, 'Contributions & Deductions._id': contriAndDeductId }, { $set: newValues });
        debugAdmin('Contributions & Deductions updated ', updateContriAndDeduct);
        res.send(updateContriAndDeduct);
    // } catch (error) {
    //     next(error);
    // }
});

// EDITTING PAYSLIP TEMPLATE FOR ALLOWANCES CATEGORY
router.put('/payslip/allowances/:id', async (req, res, next)=> {
    const id = req.params.id;
    
    // validate the input object and its properties
    const { error } = allowanceSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).send(error.details.map(items => items.message));
    
    // try {
        const allowances = await Payslip.findOne({ 'Employee.user': id }).select('Allowances -_id');
        const allowancesId = allowances['Allowances']._id;
        if (!allowances) return res.status(400).send('Payslip not found for the user');

        // add all the property values of the Allowances object
        const sum = getTotal(req.body, 'Allowances', allowances);

        // set a dot notation on a string type for the key pairs and push the total property
        const dottedPairs = makeDottedKeyPairs(req.body, 'Allowances');
        dottedPairs.push(['Allowances.Total Allowances', sum]);

        // convert the dottenPairs array to an object and update the properties
        const newValues = Object.fromEntries(dottedPairs);
        const updateAllowances = await Payslip.updateOne({ 'Employee.user': id, 'Allowances._id': allowancesId }, { $set: newValues });
        debugAdmin('Allowances updated ', updateAllowances);
        res.send(updateAllowances);
    // } catch (error) {
    //     next(error);
    // }
});

// EDITTING PAYSLIP TEMPLATE FOR HOURLY BREAKDOWN CATEGORY
router.put('/payslip/hourly-breakdown/:id', async (req, res, next)=> {
    const id = req.params.id;
    
    // validate the input object and its properties
    const { error } = hourlyBreakdownSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).send(error.details.map(items => items.message));

    // try {
        const payslip = await Payslip.findOne({ 'Employee.user': id }).select({ 'Hourly Breakdown': 1, 'Totals': 1, 'Earnings': 1 });
        const hourlyBreakdown = payslip['Hourly Breakdown'];
        const hourlyBreakdownId = hourlyBreakdown._id;
        if (!payslip) return res.status(400).send('Payslip not found for the user');

        // calculate the hourly rated from the new hours input and add Earnings object in the req.body
        getHoursRate(req.body, 'Hourly Breakdown');

        // add all the property values of the Hourly Breakdown object
        const sum = getTotal(req.body, 'Hourly Breakdown', hourlyBreakdown);

        // set a dot notation on a string type for the key pairs and push the total property
        const dottedPairs = makeDottedKeyPairs(req.body, 'Hourly Breakdown');
        const updateHourlyBreakdown = await Payslip.updateOne({ 'Employee.user': id, 'Hourly Breakdown._id': hourlyBreakdownId },
            { $set: dottedPairs.newBreakdown },
            { arrayFilters: dottedPairs.reqBodyarrayFilters }
        );
        const updateTotals = await Payslip.updateOne({ 'Employee.user': id }, {
            $set: {[`Totals.Hours`]: sum.hours,
            [`Earnings.Earnings from Hours Worked`]: sum.earnings}
    });
        debugAdmin('Hourly Breakdown updated ', updateHourlyBreakdown);
        debugAdmin('Total Hours and Earnings for hours are updated ', updateHourlyBreakdown);
        res.send(updateHourlyBreakdown);
    // } catch (error) {
    //     next(error);
    // }
});

module.exports = router;
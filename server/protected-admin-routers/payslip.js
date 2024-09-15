// NPM PACKAGES
const express = require('express');
const router = express.Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const debugAdmin = require('debug')('app:admin');

// CUSTOM MODULES/MIDDLEWARES
const { Payslip } = require('../models/payslip');
const User = require('../models/user');
const userObjectIdSchema = require('../joi-schema-validator/userObjectIdSchema');
const earningSchema = require('../joi-schema-validator/earningSchema');
const contriAndDeductSchema = require('../joi-schema-validator/contriAndDeductSchema');
const allowanceSchema = require('../joi-schema-validator/allowanceSchema');
const hourlyBreakdownSchema = require('../joi-schema-validator/hourlyBreakdownSchema');

// PAYSLIP JOI SCHEMA AND ITS FUNCTION
function schemaValidator(schema, info) {
    const result = schema.validate(info, { abortEarly: false });
    return result;
};

// HELPER FUNCTIONS
// Setting the properties of the nested object with dot notation
function makeDottedKeyPairs(reqBody, objectName) {
    if (objectName === 'Hourly Breakdown') {
        const breakdownEntries = reqBody[objectName]['breakdown'];
        const reqBodyHourType = breakdownEntries.map(items => items['Hour Type']);
        const breakdown = [];
        const reqBodyarrayFilters = [];
        for (let i = 0; reqBodyHourType.length > i; i++) {
            // get the item object accordingly to make an identifier for the arrayFilter
            const fromHourTypeObject = breakdownEntries.filter(item => item['Hour Type'] === reqBodyHourType[i]);
            const identifier = reqBodyHourType[i]
                .split(/\W/)
                .join('')
                .replace(/[^]/, reqBodyHourType[i][0].toLowerCase()); 

            // push the new updates into dotted notation with the identifier for object convertion
            breakdown.push([`Hourly Breakdown.breakdown.$[${identifier}].Hours`, fromHourTypeObject[0]['Hours']]);
            breakdown.push([`Hourly Breakdown.breakdown.$[${identifier}].Earnings`, fromHourTypeObject[0]['Earnings']]);
            reqBodyarrayFilters.push({ [`${identifier}.Hour Type`]: reqBodyHourType[i] });
        }

        // convert the array into objects and return 2 properties to pass sets of updates with updateOne method
        const { newBreakdown } = { newBreakdown: Object.fromEntries(breakdown) };
        return { newBreakdown, reqBodyarrayFilters};
    } else {
        // convert the object key value pairs in an array
        const objEntries = Object.entries(reqBody[objectName]);

        // connect the nested object property to it's child properties with dot notation on a string
        const keyPairs = objEntries.map(([keys, values]) => [`${objectName}.${keys}`, values]);
        return keyPairs;
    }
};

// sum of the nested objects from the saved values and new input values
function getTotal(reqBody, objectName, savedObject) {
    if (objectName === 'Hourly Breakdown') {
        // sum of hours and earnings that will be updated
        const breakdown = reqBody[objectName]['breakdown'];
        const reqBodyHourTypes = breakdown.map(items => items['Hour Type']);
        const sumOfNewHours = breakdown.map(items => items['Hours']).reduce((accu, curr) => accu + curr, 0);
        const sumOfNewEarnings = breakdown.map(items => items['Earnings']).reduce((accu, curr) => accu + curr, 0);

        // getting all the hours and earnings that will not be updated
        const unchangedHourTypes = savedObject['breakdown']
            .filter(item => !reqBodyHourTypes.includes(item['Hour Type']));

        //sum of the updated and not updated values to get an instant total
        const sumOfNotUpdatedHours = unchangedHourTypes
            .map(item => item['Hours'])
            .reduce((accu, curr) => accu + curr, 0);;
        const sumOfNotUpdatedEarnings = unchangedHourTypes
            .map(item => item['Earnings'])
            .reduce((accu, curr) => accu + curr, 0);;
        const totalHours = sumOfNewHours + sumOfNotUpdatedHours;
        const totalEarnings = sumOfNewEarnings + sumOfNotUpdatedEarnings;
        return { hours: totalHours, earnings: totalEarnings };
    } else {
    // convert the object key value pairs in an array
    const reqBodykeyPairs = Object.entries(reqBody[objectName]);
    const saveObjectKeyPairs = Object.entries(savedObject[objectName]._doc);

    // filter out the properties that are not going to be updated
    // and push them to an array with the properties that will be updated
    const unchangedValues =  saveObjectKeyPairs
        .filter(([keys, values]) => keys !== `Total ${objectName}` && keys !== '_id')
        .filter(([keys, values]) => !reqBody[objectName].hasOwnProperty(keys))
        .forEach(items => reqBodykeyPairs.push(items));
    
    // get the values of the properties and add them up
    const values = reqBodykeyPairs.map(([keys, values]) => values);
    const sum = Number(values.reduce((acc, curr) => acc + curr, 0).toFixed(2));
    return sum;
    }
};

// CALCULATE BREAKDOWN EARNINGS FOR HOURS ACCUMULATED
function getHoursRate(reqBody, objectName) {
    const breakdown = reqBody[objectName]['breakdown'];
    const reqBodyHourType = breakdown.map(item => item['Hour Type']);
    const earnings = 'Earnings';
    let hourlyRate = 74.747;
    let num;

    // get the index of the object for the hour type for conditional statement below
    const index = (hrType) => breakdown.findIndex(item => item['Hour Type'] === hrType);
    const getHourlyRate = hourType => {
        const hrType = breakdown.filter(type => type['Hour Type'] === hourType);
        return { numberOfHours: (rate) => Number((hrType[0]['Hours'] * rate).toFixed(2)) }
    };

    // each hour type has different calculations and hourly rates
    if (reqBodyHourType.includes('Regular Hours')) {
        num = index('Regular Hours');
        breakdown[num][earnings] = getHourlyRate('Regular Hours').numberOfHours(hourlyRate);
    }
    if (reqBodyHourType.includes('Regular Holiday Hours')) {
        num = index('Regular Holiday Hours');
        breakdown[num][earnings] = getHourlyRate('Regular Holiday Hours').numberOfHours(hourlyRate * 2);
    }
};

// ROUTERS
// CREATING A PAYLISP TEMPLATE
router.post('/payslip-template/:id', async (req, res, next) => {
    const id = req.params.id;
    const { error } = schemaValidator(userObjectIdSchema, { 'Employee': { user: id }});
    if (error) return res.status(400).send(error.details.map(items => items.message));

    try {
        const user = await User.findOne({ _id: id });
        if (!user) return res.status(400).send('Invalid ID')

        const savedPayslip = await Payslip.findOne({ 'Employee.user': id });
        if (savedPayslip) return res.send(savedPayslip);
        else {
            const payslip = new Payslip({ 'Employee.user': id });
            await payslip.save()
            res.status(201).send(payslip);
        }
    } catch (error) {
        next(error);
    }
});

// EDITTING PAYSLIP TEMPLATE FOR EARNINGS CATEGORY
router.put('/payslip/earnings/:id', async (req, res, next)=> {
    const id = req.params.id;
    
    // validate the input object and its properties
    const { error } = schemaValidator(earningSchema, req.body);
    if (error) return res.status(400).send(error.details.map(items => items.message));
    
    try {
        const earningObject = await Payslip.findOne({ user: id }).select('Earnings -_id');
        const earningId = earningObject['Earnings']._id;
        if (!earningObject) return res.status(400).send('Payslip not found for the user');

        // add all the property values of the Earning object
        const sum = getTotal(req.body, 'Earnings', earningObject);

        // set a dot notation on a string type for the key pairs and push the total property
        const dottedPairs = makeDottedKeyPairs(req.body, 'Earnings');
        dottedPairs.push(['Earnings.Total Earnings', sum]);

        // convert the dottenPairs array to an object and update the properties
        const newValues = Object.fromEntries(dottedPairs);
        const updateEarnings = await Payslip.updateOne({ user: id, 'Earnings._id': earningId }, { $set: newValues });
        debugAdmin('Earnings updated ', updateEarnings);
        res.send(updateEarnings);
    } catch (error) {
        next(error);
    }
});

// EDITTING PAYSLIP TEMPLATE FOR CONTRIBUTION AND DEDUCTION CATEGORY
router.put('/payslip/contributions-and-deductions/:id', async (req, res, next)=> {
    const id = req.params.id;
    
    // validate the input object and its properties
    const { error } = schemaValidator(contriAndDeductSchema, req.body);
    if (error) return res.status(400).send(error.details.map(items => items.message));

    try {
        const contriAndDeduct = await Payslip.findOne({ user: id }).select({ 'Contributions & Deductions': 1, _id: 0 });
        const contriAndDeductId = contriAndDeduct['Contributions & Deductions']._id;
        if (!contriAndDeduct) return res.status(400).send('Payslip not found for the user');

        // add all the property values of the Contributions & Deductions object
        const sum = getTotal(req.body, 'Contributions & Deductions', contriAndDeduct);

        // set a dot notation on a string type for the key pairs and push the total property
        const dottedPairs = makeDottedKeyPairs(req.body, 'Contributions & Deductions');
        dottedPairs.push(['Contributions & Deductions.Total Contributions & Deductions', sum]);

        // convert the dottenPairs array to an object and update the properties
        const newValues = Object.fromEntries(dottedPairs);
        const updateContriAndDeduct = await Payslip.updateOne({ user: id, 'Contributions & Deductions._id': contriAndDeductId }, { $set: newValues });
        debugAdmin('Contributions & Deductions updated ', updateContriAndDeduct);
        res.send(updateContriAndDeduct);
    } catch (error) {
        next(error);
    }
});

// EDITTING PAYSLIP TEMPLATE FOR ALLOWANCES CATEGORY
router.put('/payslip/allowances/:id', async (req, res, next)=> {
    const id = req.params.id;
    
    // validate the input object and its properties
    const { error } = schemaValidator(allowanceSchema, req.body);
    if (error) return res.status(400).send(error.details.map(items => items.message));
    
    try {
        const allowances = await Payslip.findOne({ user: id }).select('Allowances -_id');
        const allowancesId = allowances['Allowances']._id;
        if (!allowances) return res.status(400).send('Payslip not found for the user');

        // add all the property values of the Allowances object
        const sum = getTotal(req.body, 'Allowances', allowances);

        // set a dot notation on a string type for the key pairs and push the total property
        const dottedPairs = makeDottedKeyPairs(req.body, 'Allowances');
        dottedPairs.push(['Allowances.Total Allowances', sum]);

        // convert the dottenPairs array to an object and update the properties
        const newValues = Object.fromEntries(dottedPairs);
        const updateAllowances = await Payslip.updateOne({ user: id, 'Allowances._id': allowancesId }, { $set: newValues });
        debugAdmin('Allowances updated ', updateAllowances);
        res.send(updateAllowances);
    } catch (error) {
        next(error);
    }
});

// EDITTING PAYSLIP TEMPLATE FOR HOURLY BREAKDOWN CATEGORY
router.put('/payslip/hourly-breakdown/:id', async (req, res, next)=> {
    const id = req.params.id;
    
    // validate the input object and its properties
    const { error } = schemaValidator(hourlyBreakdownSchema, req.body);
    if (error) return res.status(400).send(error.details.map(items => items.message));

    try {
        const payslip = await Payslip.findOne({ user: id }).select({ 'Hourly Breakdown': 1, 'Totals': 1, 'Earnings': 1 });
        const hourlyBreakdown = payslip['Hourly Breakdown'];
        const hourlyBreakdownId = hourlyBreakdown._id;
        if (!payslip) return res.status(400).send('Payslip not found for the user');

        // calculate the hourly rated from the new hours input and add Earnings object in the req.body
        getHoursRate(req.body, 'Hourly Breakdown');

        // add all the property values of the Hourly Breakdown object
        const sum = getTotal(req.body, 'Hourly Breakdown', hourlyBreakdown);

        // set a dot notation on a string type for the key pairs and push the total property
        const dottedPairs = makeDottedKeyPairs(req.body, 'Hourly Breakdown');
        const updateHourlyBreakdown = await Payslip.updateOne({ user: id, 'Hourly Breakdown._id': hourlyBreakdownId },
            { $set: dottedPairs.newBreakdown },
            { arrayFilters: dottedPairs.reqBodyarrayFilters }
        );
        const updateTotals = await Payslip.updateOne({ user: id }, {
            $set: {[`Totals.Hours`]: sum.hours,
            [`Earnings.Earnings from Hours Worked`]: sum.earnings}
    });
        debugAdmin('Hourly Breakdown updated ', updateHourlyBreakdown);
        debugAdmin('Total Hours and Earnings for hours are updated ', updateHourlyBreakdown);
        res.send(updateHourlyBreakdown);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
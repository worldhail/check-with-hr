// NPM PACKAGES
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const debugAdmin = require('debug')('app:admin');

// CUSTOM MODULES/MIDDLEWARES
const { hourlyType, Payslip } = require('../models/payslip');

// PAYSLIP JOI SCHEMA AND ITS FUNCTION
function schemaValidator(schema, info) {
    const result = schema.validate(info, { abortEarly: false });
    return result;
};

const earningSchema =  Joi.object({
    'Earnings': Joi.object({
        'Earnings from Hours Worked': Joi.number().default(0),
        'Performance Bonus / Attendance bonus': Joi.number().default(0),
        'Other Earnings / Relocation / Referral': Joi.number().default(0)
    })
});

const contriAndDeductSchema = Joi.object({
    'Contributions & Deductions': Joi.object({
        'Pag-IBIG': Joi.number().default(0),
        'SSS': Joi.number().default(0),
        'Philhealth': Joi.number().default(0),
        'BIR Withholding Tax': Joi.number().default(0),
        'SSS Loan Repayment': Joi.number().default(0),
        'Pagibig Loan Repayment': Joi.number().default(0),
        'Other Deductions': Joi.number().default(0)
    })
});

const allowanceSchema = Joi.object({
    'Allowances': Joi.object({
        'Rice Allowance': Joi.number().default(0),
        'Laundry Allowance': Joi.number().default(0),
        'Medical Cash Allowance': Joi.number().default(0),
        'Uniform Allowance': Joi.number().default(0),
        'Employee Pag-IBIG share paid by Smiles': Joi.number().default(0),
        'Employee Philhealth share paid by Smiles': Joi.number().default(0),
        '13th Month': Joi.number().default(0),
        'Complexity Pay': Joi.number().default(0),
        'Other Allowances': Joi.number().default(0)
    })
});

const hourlyBreakdownSchema = Joi.object({
    'Hourly Breakdown': {
        'Hour Type': Joi.string(),
        'Hours': Joi.number().default(0),
        'Earnings': Joi.number().default(0)
    }
});

// HELPER FUNCTIONS
// Setting the properties of the nested object with dot notation
function makeDottedKeyPairs(reqBody, objectName) {
    // convert the object key value pairs in an array
    const objValue = Object.entries(reqBody[objectName]);
    
    // connect the nested object property to it's child properties with dot notation on a string
    const keyPairs = objValue.map(([keys, values]) => [`${objectName}.${keys}`, values]);
    return keyPairs;
};

// sum of the nested objects from the saved values and new input values
function getTotal(reqBody, objectName, savedObject) {
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
};

// ROUTERS
// CREATING A PAYLISP TEMPLATE
router.post('/payslip-template/:id', async (req, res, next) => {
    const id = req.params.id;
    try {
        const savedPayslip = await Payslip.findOne({ user: id });
        if (savedPayslip) return res.send(savedPayslip);
        else {
            // make an instance of the hourly type for the hourly breakdown
            const breakdown = [];
            for (let i = 0; hourlyType.length > i; i++) {
                breakdown.push({'Hour Type': hourlyType[i]})
            }

            const payslip = new Payslip({ user: id, 'Hourly Breakdown': breakdown });
            await payslip.save();
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
        debugAdmin('idasdf', contriAndDeduct, contriAndDeductId);
        if (!contriAndDeduct) return res.status(400).send('Payslip not found for the user');

        // add all the property values of the Earning object
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

        // add all the property values of the Earning object
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

module.exports = router;
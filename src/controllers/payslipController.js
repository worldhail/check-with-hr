// NPM PACKAGES
import debug from 'debug';
const debugAdmin = debug('app:admin');

// CUSTOM MODULES/MIDDLEWARES
import makeDottedKeyPairs from '../services/makeDottedKeyPairs.js';
import getTotal from '../services/getTotal.js';
import getHoursRate from '../services/getHoursRate.js';
import getPayslip from '../services/getPayslip.js';
import createPayslipTemplate from '../services/createPayslipTemplate.js';
import updatePayslip from '../services/updatePayslip.js';

// CREATING A PAYLISP TEMPLATE
export const payslipTemplate = async (req, res) => {
    const id = req.params.id;
    const retrievePayslip = await getPayslip(id);

    const payslip = retrievePayslip ?? await createPayslipTemplate(id);

    res.status(retrievePayslip ? 200 : 201).send(payslip);
};

// EDITTING PAYSLIP TEMPLATE FOR EARNINGS CATEGORY
export const updateEarnings = async (req, res)=> {
    const id = req.params.id;

    const payslip = await getPayslip(id, 'Earnings -_id');
    if (!payslip) return res.status(404).send('Payslip not found for the user');

    // add input and not updated property values
    const sum = getTotal(payslip, 'Earnings', req.body);

    // set a dot notation on a string type for the key pairs and push the total property
    const dottedPairs = makeDottedKeyPairs(sum, req.body, 'Earnings');

    const updateEarnings = await updatePayslip(id, dottedPairs);
    debugAdmin('Earnings updated ', updateEarnings);
    res.send(updateEarnings);
};

// EDITTING PAYSLIP TEMPLATE FOR CONTRIBUTION AND DEDUCTION CATEGORY
export const updateContributionAndDeductions = async (req, res)=> {
    const id = req.params.id;

    const payslip = await getPayslip(id, { 'Contributions & Deductions': 1, _id: 0 });
    if (!payslip) return res.status(404).send('Payslip not found for the user');

    // add all the property values of the Contributions & Deductions object
    const sum = getTotal(payslip, 'Contributions & Deductions', req.body);

    // set a dot notation on a string type for the key pairs and push the total property
    const dottedPairs = makeDottedKeyPairs(sum, req.body, 'Contributions & Deductions');

    // convert the dottenPairs array to an object and update the properties
    const updateContriAndDeduct = await updatePayslip(id, dottedPairs);
    debugAdmin(`Contributions & Deductions updated `, updateContriAndDeduct);
    res.send(updateContriAndDeduct);
};

// EDITTING PAYSLIP TEMPLATE FOR ALLOWANCES CATEGORY
export const updateAllowances = async (req, res)=> {
    const id = req.params.id;
    
    const payslip = await getPayslip(id, 'Allowances -_id');
    if (!payslip) return res.status(404).send('Payslip not found for the user');

    // add all the property values of the Allowances object
    const sum = getTotal(payslip, 'Allowances', req.body);

    // set a dot notation on a string type for the key pairs and push the total property
    const dottedPairs = makeDottedKeyPairs(sum, req.body, 'Allowances');

    // convert the dottenPairs array to an object and update the properties
    const updateAllowances = await updatePayslip(id, dottedPairs);
    debugAdmin('Allowances updated ', updateAllowances);
    res.send(updateAllowances);
};

// EDITTING PAYSLIP TEMPLATE FOR HOURLY BREAKDOWN CATEGORY
export const updateHourlyBreakdown = async (req, res)=> {
    const id = req.params.id;

    const payslip = await getPayslip(id, { 'Hourly Breakdown': 1, 'Totals': 1, 'Earnings': 1 });
    if (!payslip) return res.status(404).send('Payslip not found for the user');

    // calculate the hourly rated from the new hours input and add Earnings object in the req.body
    getHoursRate(req.body, 'Hourly Breakdown');

    // add all the property values of the Hourly Breakdown object
    const sum = getTotal(payslip, 'Hourly Breakdown', req.body);

    // set a dot notation on a string type for the key pairs and push the total property
    const { newBreakdown, inputArrayFilters } = makeDottedKeyPairs(sum, req.body, 'Hourly Breakdown');

    const updateHourlyBreakdown = await updatePayslip(id, newBreakdown, inputArrayFilters);
    debugAdmin('Hourly Breakdown updated ', updateHourlyBreakdown);
    debugAdmin('Total Hours and Earnings for hours are updated ', updateHourlyBreakdown);
    res.send(updateHourlyBreakdown);
};
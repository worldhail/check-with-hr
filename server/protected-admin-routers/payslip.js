// NPM PACKAGES
const express = require('express');
const router = express.Router();
const Joi = require('joi');

// CUSTOM MODULES/MIDDLEWARES
const { Payslip, hourlyType } = require('../models/payslip');

// ROUTER
router.post('/payslip-template', async (req, res, next) => {
    const breakdown = [];
    for (let i = 0; hourlyType.length > i; i++) {
        breakdown.push({ ['Hour Type']: hourlyType[i] });
    }

    // const sum = this['Hourly Breakdown'].reduce((a, b) => a['Hours'] + b['Hours'], 0);
    // this['Net Earnings'] = sum;
    
    try {
        const paySlip = new Payslip({ ['Hourly Breakdown']: breakdown });
        res.send(paySlip);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
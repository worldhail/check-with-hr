// NPM PACKAGES
const express = require('express');
const router = express.Router();

// CUSTOMER MODULES/MIDDLEWARES
const LeaveCredits = require('../models/leave-credits');

router.get('/leave-credits', async (req, res) => {
    const userCredits = await LeaveCredits.findOne({ user: req.user._id }); 
    res.send(userCredits);
});

module.exports = router;
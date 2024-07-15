// NPM PACKAGES
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const debugUser = require('debug')('app:user');

// CUSTOM MODULES/MIDDLEWARES
const { User } = require('../models/user');

// RATE LIMITER CONFIGURATION
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // limit each IP to 5 requests per windowMs
    message: 'Too many requests attempted, please try again after 24 hours'
});

// TAGGED AS VERIFIED EMAIL ADDRESS ONCE VISITED THIS ROUTE
router.get('/user/complete', limiter, async (req, res, next) => {
    try {
        // check if token is present and valid
        const { token } = req.query;
        if (!token) return res.status(400).send('Invalid request');
    
        const user = await User.findOne({ verificationToken: token });
        if (!user) return res.status(404).send('User not found or token has expired');
        if (user.isVerified) return res.status(400).send('User is already verified');

        // tag user as verified and remove verification token
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        debugUser('Email verified successfully');
        res.status(201).redirect('/api/login/user');
    } catch (error) {
        next(error);
    }
});

module.exports = router;
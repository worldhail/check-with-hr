// NPM PACKAGES
const express = require('express');
const router = express.Router();

// CUSTOMER MODULES/MIDDLEWARES
const { User } = require('../models/user');

// GET PROFILE OF ADMIN
router.get('profile', async (req, res, next) => {
    try {
        const profile = await User.findById(req.user._id)
            .select('-_id -password -date -role -isVerified -verificationToken -__v ');
        if (!profile) {
            res.clearCookie('x-auth-token');
            return res.status(404).send('User not found');
        }

        res.send(profile);
    } catch (error) {
        next(error);
    }
});
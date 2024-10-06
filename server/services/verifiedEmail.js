// NPM PACKAGES
import express from 'express';
const router = express.Router();
import debug from 'debug';
const debugUser = debug('app:user');

// CUSTOM MODULES/MIDDLEWARES
import User from '../models/user.js';

// TAGGED AS VERIFIED EMAIL ADDRESS ONCE VISITED THIS ROUTE
router.get('/user/complete', async (req, res) => {
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
});

export default router;
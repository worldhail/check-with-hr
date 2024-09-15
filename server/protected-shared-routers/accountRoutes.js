// NPM PACKAGES
const express = require('express');
const router = express.Router();
const debugUser = require('debug')('app:user');
const Joi = require('joi');
const bcrypt = require('bcrypt');

// CUSTOMER MODULES/MIDDLEWARES
const User = require('../models/user');
const getTenurity = require('../utils/getTenurity');
const validateUserInfo = require('../utils/validateUserInfo');

//GET - USERS INFORMATION
router.get('/profile', async (req, res, next) => {
    try {
        const profile = await User.findById(req.user._id)
            .select('-_id -password -date -role -isVerified -verificationToken -__v ');
        if (!profile) {
            res.clearCookie('x-auth-token');
            return res.status(404).send('User not found');
        }

        debugUser(`Welcome to ${req.user.role} account`);
        res.send(profile);
    } catch (error) {
        next(error);
    }
});

//PUT - CHANGE EMAIL ADDRESS
router.put('/email', async (req, res, next) => {
    // email schema - validate the email format
    function validateEmail(email) {
        const emailSchema = Joi.object({
            newEmail: Joi.string().min(5).max(55).email().required()
        });

        const result = emailSchema.validate(email);
        return result;
    };

    // validate the new email from the request body
    const { error } = validateEmail(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        let authorizeUser = await User.findOne({ _id: req.user._id });
        if (authorizeUser.email === req.body.newEmail) return res.status(400).send('Please provide a new email or cancel if you do not want to change it.');

        const existingUser = await User.findOne({ email: req.body.newEmail });
        if (existingUser) return res.status(400).send('Email is already registered.');
        
        const updatedEmail = await User.updateOne({ _id: req.user._id }, { $set: { email: req.body.newEmail }});
        debugUser('Email updated, ', updatedEmail);

        // store user email and which endpoint it's coming from
        const token = authorizeUser.getVerificationToken(req.body.newEmail);
        authorizeUser.verificationToken = token;
        authorizeUser.isVerified = false;
        authorizeUser = await authorizeUser.save();
        
        const newUser = {
            verificationToken: token,
            email: req.body.newEmail,
            fromMethod: req.method,
            fromUrl: req.originalUrl
        };

        debugUser('Sending email verification...')
        req.session.newUser = newUser;
        res.clearCookie('x-auth-token');
        res.redirect('/api/new/email-send');
    } catch (error) {
        next(error);
    }
});

// POST - ENTER PASSWORD BEFORE GRANTING REQUEST FOR EMAIL CHANGE
router.post('/current-password', async (req, res, next) => {
    // password schema - validate the password format
    function validatePassword (password) {
        const passwordSchema = Joi.object({
            password: Joi.string().min(8).max(255).alphanum().required()
        });

        const result = passwordSchema.validate(password);
        return result;
    }
    // validate the required password from the request body
    const { error } = validatePassword(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // if password is valid get back to the email endpoint to enter new password
    try {
        const authorizeUser = await User.findOne({ _id: req.user._id });
        const validPassword = await bcrypt.compare(req.body.password, authorizeUser.password);
        if (!validPassword) return res.status(400).send('Incorrect password');

        debugUser('Ready for email alteration');
        res.redirect('/api/account-routes/email');
    } catch (error) {
        next(error);
    }
});

// PUT - CHANGE PASSWORD
router.put('/password', async (req, res, next) => {
    // password schema - validate the password format
    function validatePassword (password) {
        const passwordSchema = Joi.object({
            currentPassword: Joi.string().min(8).max(255).alphanum().required(),
            newPassword: Joi.string().min(8).max(255).alphanum().required(),
            confirmNewPassword: Joi.string().min(8).max(255).alphanum().required()
        });

        const result = passwordSchema.validate(password);
        return result;
    }

    // validate the required password from the request body
    const { error } = validatePassword(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // update new password
    try {
        const user = await User.findById(req.user._id);
        const currentPassword = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!currentPassword) return res.status(400).send('Invalid current password');
        //Password matched! - should be added in the client side.
        if (req.body.currentPassword === req.body.newPassword) return res.status(400).send('New password must not be the same as the current password');
        if (req.body.newPassword !== req.body.confirmNewPassword) return res.status(400).send('Confirmed password does not match');
        
        // hash new password and remove old token to cut off access
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS, 10));
        const hash = await bcrypt.hash(req.body.newPassword, salt);
        const newPassword = hash;
        const updatePassword = await User.updateOne({ _id: req.user._id }, { $set: { password: newPassword }});
        debugUser('Password successfully updated', updatePassword);
        res.clearCookie('x-auth-token');
        res.redirect('/api/login/user');
    } catch (error) {
        next(error);
    }
});

// MODIFICATIONS - UPDATE OTHER INFO
router.put('/personal-info', async (req, res, next) => {
    // validate required user info from the request body
    const { error } = validateUserInfo(req.body);
    if (error) {
        const details = error.details;
        const message = details.map( err => err.message );
        return res.status(400).send(message);
    };

    // update user info
    try {
        const existingUser = await User.findOne({ employeeID: req.body.employeeID });
        const authorizeUser = await User.findOne({ _id: req.user._id });
        // if new employeeID is not the current one and it exists, will not be validated
        if (existingUser.employeeID === req.body.employeeID) {
            if (authorizeUser.employeeID !== req.body.employeeID) return res.status(400).send(`EmployeeID is already registered.`);
        };
        
        const date = new Date(req.body.hireDate);
        await User.updateOne({ _id: req.user._id }, { $set: { tenurity: getTenurity(date) }})
        const updateUser = await User.updateOne({ _id: req.user._id }, req.body);
        debugUser('Personal information updated ', updateUser);
        res.redirect('/api/account-routes/profile');
    } catch (error) {
        next(error);
    }
});

// POST - LOGOUT
router.post('/logout', async (req, res, next) => {
    try {
        res.clearCookie('x-auth-token');
        req.session.destroy();
        debugUser('Logout successfully');
        res.redirect('/api/login/user');
    } catch (error) {
        next(error);
    }
});

// DELETE - USER ACCOUNT
router.delete('/account', async (req, res, next) => {
    try {
        const deleteMyAccount = await User.deleteOne({ _id: req.user._id });
        res.clearCookie('x-auth-token');
        debugUser('Account successfully deleted', deleteMyAccount);
        res.send('/api/sign-up');
    } catch (error) {
        next(error);
    }
});

module.exports = router;
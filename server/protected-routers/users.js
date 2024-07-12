// NPM PACKAGES
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const _pick = require('lodash.pick');
const bcrypt = require('bcrypt');
const debugUser = require('debug')('app:user');

// CUSTOMER MODULES/MIDDLEWARES
const { User, getTenurity } = require('../models/user');

//USER PROPERTIES
const userKeys = [
    'employeeID',
    'firstName', 
    'lastName',
    'department',
    'position',
    'hireDate',
    'address',
    'employmentStatus'
];

//GET - USERS INFORMATION
router.get('/profile', async (req, res, next) => {
    try {
        const profile = await User.findById(req.user._id).select('-_id -password -date');
        if (!profile) {
            res.clearCookie('x-auth-token');
            return res.status(404).send('User not found');
        }

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
            newEmail: Joi.string().min(5).max(55).email().unique().required()
        });

        const result = emailSchema.validate(email);
        return result;
    };

    // validate the new email from the request body
    const { error } = validateEmail(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // if email not exist, update email
    try {
        const existingUser = await User.findOne({ email });
        const authorizeUser = await User.findOne({ _id: req.user._id });
        if (existingUser.email && authorizeUser.email !== existingUser.email) return res.status(400).send(`Email is already registered.`);
        const updatedEmail = await User.updateOne({ _id: req.user._id }, { $set: { email }});
        debugUser('%o', updatedEmail);
        res.send('Email succesfully updated');
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
        debugUser('%o', updatePassword);
        res.clearCookie('x-auth-token');
        res.send('Password successfully updated');
    } catch (error) {
        next(error);
    }
});

// MODIFICATIONS - UPDATE OTHER INFO
router.put('/info', async (req, res, next) => {
    // validate required user info from the request body
    const { error } = validateOtherInfo(req.body);
    if (error) {
        const details = error.details;
        const message = details.map( err => err.message );
        return res.status(400).send(message);
    };

    // update user info
    try {
        const existingUser = await User.findOne({ employeeID: req.body.employeeID });
        const authorizeUser = await User.findOne({ _id: req.user._id });
        if (existingUser.employeeID && authorizeUser.employeeID !== existingUser.employeeID) return res.status(400).send(`EmployeeID is already registered.`);
        
        const date = new Date(req.body.hireDate);
        await User.updateOne({ _id: req.user._id }, { $set: { tenurity: getTenurity(date) }})
        const updateUser = await User.updateOne({ _id: req.user._id }, _pick(req.body, userKeys));
        debugUser(updateUser);
        res.send('Information successfully updated');
    } catch (error) {
        next(error);
    }
});
 
// VALIDATOR FOR USER INFO MODIFICATION
function validateOtherInfo (userInfo) {
    const userSchema = Joi.object({
        employeeID: Joi.string().alphanum().min(5).max(55).required(),
        firstName: Joi.string().min(2).max(55).required(),
        lastName: Joi.string().min(2).max(55).required(),
        department: Joi.string().min(5).max(55).required(),
        position: Joi.string().min(2).max(55).required(),
        hireDate: Joi.date().iso().required(),
        address: {
            street: Joi.string().min(3).max(55).required(),
            barangay: Joi.string().min(3).max(55).required(),
            city: Joi.string().min(3).max(55).required(),
            province: Joi.string().min(3).max(55).required(),
            zipCode: Joi.string().min(2).max(55).required(),
        },
        employmentStatus: Joi.string().min(5).max(55).required()
    });

    const result = userSchema.validate(userInfo, { abortEarly: false });
    return result;
};

//DELETE - USER ACCOUNT
router.delete('/account', async (req, res, next) => {
    try {
        const deleteMyAccount = await User.deleteOne({ _id: req.user._id });
        res.clearCookie('x-auth-token');
        debugUser(deleteMyAccount);
        res.send('Account successfully deleted');
    } catch (error) {
        next(error);
    }
});

module.exports = router;
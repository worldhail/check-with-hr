// NPM PACKAGES
import express from 'express';
const router = express.Router();
import debug from 'debug';
const debugUser = debug('app:user');
const debugError = debug('app:error');
import Joi from 'joi';
import bcrypt from 'bcrypt';

// CUSTOMER MODULES/MIDDLEWARES
import User from '../models/user.js';
import getTenurity from '../utils/getTenurity.js';
import profileSchema from '../joi-schema-validator/profileSchema.js';
import newPasswordSchema from '../joi-schema-validator/newPasswordSchema.js';

//GET - USERS INFORMATION
router.get('/profile', async (req, res) => {
    const profile = await User.findById(req.user._id)
        .select('-_id -password -date -role -isVerified -verificationToken -__v ');
    if (!profile) {
        res.clearCookie('x-auth-token');
        return res.status(404).send('User not found');
    }

    debugUser(`Welcome to ${req.user.role} account`);
    res.send(profile);
});

//PUT - CHANGE EMAIL ADDRESS
router.put('/email', async (req, res) => {
    // email schema - validate the email format
    const emailSchema = Joi.object({ newEmail: Joi.string().min(5).max(55).email().required() });

    // validate the new email from the request body
    const { error } = emailSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

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
});

// POST - ENTER PASSWORD BEFORE GRANTING REQUEST FOR EMAIL CHANGE
router.post('/current-password', async (req, res) => {
    // password schema - validate the password format
    const passwordSchema = Joi.object({ password: Joi.string().min(8).max(255).alphanum().required() });
    
    // validate the required password from the request body
    const { error } = passwordSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // if password is valid get back to the email endpoint to enter new password
    const authorizeUser = await User.findOne({ _id: req.user._id });
    const validPassword = await bcrypt.compare(req.body.password, authorizeUser.password);
    if (!validPassword) return res.status(400).send('Incorrect password');

    debugUser('Ready for email alteration');
    res.redirect('/api/account-routes/email');
});

// PUT - CHANGE PASSWORD
router.put('/password', async (req, res) => {
    // validate the required password from the request body
    const { error } = newPasswordSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // update new password
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
});

// MODIFICATIONS - UPDATE OTHER INFO
router.put('/personal-info', async (req, res) => {
    // validate required user info from the request body
    const { error } = profileSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const details = error.details;
        const message = details.map( err => err.message );
        return res.status(400).send(message);
    };

    // update user info
    const existingUser = await User.findOne({ employeeID: req.body.employeeID });
    const authorizeUser = await User.findOne({ _id: req.user._id });

    // if not exists, then employeeID is good to update
    if (existingUser) {
        if (authorizeUser.employeeID !== req.body.employeeID) return res.status(400).send(`EmployeeID is already registered.`);
    };
    
    const date = new Date(req.body.hireDate);
    await User.updateOne({ _id: req.user._id }, { $set: { tenurity: getTenurity(date) }})
    const updateUser = await User.updateOne({ _id: req.user._id }, req.body);
    debugUser('Personal information updated ', updateUser);
    res.redirect('/api/account-routes/profile');
});

// POST - LOGOUT
router.post('/logout', async (req, res) => {
    res.clearCookie('x-auth-token');
    req.session.destroy(err => {
        if (err) {
            debugError('Error destroying session:', err);
            return res.status(500).send('Error during logout');  // Handle any errors
        }
    });
    debugUser('Logout successfully');
    res.redirect('/api/login/user');
});

// DELETE - USER ACCOUNT
router.delete('/account', async (req, res) => {
    const deleteMyAccount = await User.deleteOne({ _id: req.user._id });
    res.clearCookie('x-auth-token');
    debugUser('Account successfully deleted', deleteMyAccount);
    res.send('/api/sign-up');
});

export default router;
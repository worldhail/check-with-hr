// NPM PACKAGES
import mongoose from 'mongoose';
import debug from 'debug';
const debugUser = debug('app:user');

// CUSTOMER MODULES/MIDDLEWARES
import User from '../models/user.js';
import getUser from '../services/getUser.js';
import updateUser from '../services/updateUser.js';
import comparePassword from '../services/comparePassword.js';
import hashPassword from '../services/hashPassword.js';
import activeSession from '../utils/activeSession.js';

//GET - USERS INFORMATION
export const profile = async (req, res) => {
    const authorizedUser = await getUser({ _id: req.user._id }, { url: req.url});
    if (!authorizedUser) {
        res.clearCookie('x-auth-token');
        return res.status(404).send('User not found');
    };

    debugUser(`Welcome to ${req.user.role} account`);
    res.send(authorizedUser);
};

//PUT - CHANGE EMAIL ADDRESS
export const updateEmail = async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        const authorizedUser = await getUser({ _id: req.user._id });
        if (!authorizedUser) {
            res.clearCookie('x-auth-token');
            return res.status(404).send('User not found');
        };

        if (authorizedUser.email === req.body.newEmail) {
            return res.status(400).send('Please provide a new email or cancel if you do not want to change it.');
        };

        session.startTransaction();

        const isEmailExist = await getUser({ email: req.body.newEmail }, { session });
        if (isEmailExist) {
            await session.abortTransaction();
            return res.status(400).send('Email is already registered.');
        }

        const token = authorizedUser.getVerificationToken(req.body.newEmail);
        const updatedEmail = await updateUser(
            { _id: req.user._id },
            { email: req.body.newEmail, isVerified: false, verificationToken: token },
            { req, token, session }
        );
        
        await session.commitTransaction();

        debugUser('Email updated, ', updatedEmail);
        debugUser('Sending email verification...')
        res.clearCookie('x-auth-token');
        res.redirect('/api/new/email-send');
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

// POST - ENTER PASSWORD BEFORE GRANTING REQUEST FOR EMAIL CHANGE
export const verifyPassword = async (req, res) => {
    // if password is valid get back to the email endpoint to enter new password
    const authorizedUser = await getUser({ _id: req.user._id });
    const isValidPassword = await comparePassword(req.body.password, authorizedUser.password);
    if (!isValidPassword) return res.status(400).send('Incorrect password');

    debugUser('Ready for email alteration');
    res.redirect('/api/account-routes/email');
};

// PUT - CHANGE PASSWORD
export const updatePassword = async (req, res, next) => {
    const session = await mongoose.startSession();
    
    try {
        // update new password
        const user = await getUser({ _id: req.user._id });
        const isCurrentPassword = await comparePassword(req.body.currentPassword, user.password);
        if (!isCurrentPassword) return res.status(400).send('Invalid current password');

        //Password matched! - should be added in the client side.
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        if (currentPassword === newPassword) return res.status(400).send('New password must not be the same as the current password');
        if (newPassword !== confirmNewPassword) return res.status(400).send('Confirmed password does not match');

        session.startTransaction();

        const hashNewPassword = await hashPassword(newPassword);
        const updatePassword = await updateUser({ _id: req.user._id }, { password: hashNewPassword }, { session });

        await session.commitTransaction();
        
        debugUser('Password successfully updated', updatePassword);
        res.clearCookie('x-auth-token');
        res.redirect('/api/login/user');
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

// MODIFICATIONS - UPDATE OTHER INFO
export const updatePersonalInformation = async (req, res, next) => {
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();

        // update user info
        const isEmployeeIDExist = await getUser({ employeeID: req.body.employeeID }, { session });
        const authorizedUser = await getUser({ _id: req.user._id });

        // if not exists aside from the authorized user, then employeeID is good to update
        if (isEmployeeIDExist) {
            if (authorizedUser.employeeID !== req.body.employeeID) {
                await session.abortTransaction();
                return res.status(400).send(`EmployeeID is already registered.`);
            }
        };

        const updateInfo = await updateUser({ _id: req.user._id }, req.body, { from: 'personal_info', session});
        
        await session.commitTransaction();

        debugUser('Personal information updated ', updateInfo);
        res.redirect('/api/account-routes/profile');
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

// POST - LOGOUT
export const logoutAccount = async (req, res) => {
    res.clearCookie('x-auth-token');
    req.session.destroy(err => activeSession(err, 'Error during logout'));
    debugUser('Logout successfully');
    res.redirect('/api/login/user');
};

// DELETE - USER ACCOUNT
export const deleteAccount = async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        const authorizedUser = await getUser({ _id: req.user._id });
        if (!authorizedUser) return res.status(400).send('User not found');
        
        session.startTransaction();

        const deleteMyAccount = await User.deleteOne({ _id: req.user._id }, { session });

        await session.commitTransaction();

        res.clearCookie('x-auth-token');
        debugUser('Account successfully deleted', deleteMyAccount);
        res.redirect('/api/sign-up');
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};
// NPM PACKAGES
import mongoose from 'mongoose';
import debug from 'debug';
const debugUser = debug('app:user');

// CUSTOM MODULES/MIDDLEWARES
import User from '../models/user.js';
import getUser from '../services/getUser.js';
import hashPassword from '../services/hashPassword.js';
import makeSessionDataWith from '../services/makeSessionDataWith.js';
import activeSession from '../utils/activeSession.js';

// POST - USER SIGN-UP
export default async (req, res, next) => {
    // if user not exists, create a new user
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const isUserExist = await getUser({
            $or: [
                { email: req.body.email }, 
                { employeeID: req.body.employeeID }
            ]},
            { session }
        );

        if (isUserExist) {
            await session.abortTransaction();
            if (isUserExist.email === req.body.email) return res.status(400).send(`Email is already registered.`);
            if (isUserExist.employeeID === req.body.employeeID) return res.status(400).send(`EmployeeID is already registered.`);
        }

        // hash password, and save user information to the datebase
        let user = new User(req.body);
        user.password = await hashPassword(user.password);
        user = await user.save({ session });

        req.session.newUser = makeSessionDataWith(req, user.verificationToken);

        await session.commitTransaction();

        debugUser('User successfully registered');
        debugUser('Sending email verification...')
        res.redirect('/api/new/email-send');
    } catch (error) {
        req.session.destroy(err => activeSession(err, 'Error during sign-up'));
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};
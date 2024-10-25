// NPM PACKAGES
import express from 'express';
const router = express.Router();
import debug from 'debug';
const debugUser = debug('app:user');

// CUSTOM MODULES/MIDDLEWARES
import User from '../models/user.js';
import userInstanceSchema from '../joi-schema-validator/userInstanceSchema.js';
import getUser from '../services/getUser.js';
import hashPassword from '../services/hashPassword.js';
import makeSessionDataWith from '../services/makeSessionDataWith.js';
import validate from '../middleware/validate.js';
import activeSession from '../utils/activeSession.js';

// POST - USER SIGN-UP
export default router.post('/user', async (req, res, next) => {
    // if user not exists, create a new user
    try {
        const isUserExist = await getUser({
            $or: [
                { email: req.body.email }, 
                { employeeID: req.body.employeeID }
            ]});

        if (isUserExist) {
            if (isUserExist.email === req.body.email) return res.status(400).send(`Email is already registered.`);
            if (isUserExist.employeeID === req.body.employeeID) return res.status(400).send(`EmployeeID is already registered.`);
        }

        // validate required user input
        validate(userInstanceSchema);

        // hash password, and save user information to the datebase
        let user = new User(req.body);
        user.password = await hashPassword(user.password);
        user = await user.save();

        req.session.newUser = makeSessionDataWith(req, user.verificationToken);;
        debugUser('User successfully registered');
        debugUser('Sending email verification...')
        res.status(201).redirect('/api/new/email-send');
    } catch (error) {
        req.session.destroy(err => activeSession(err, 'Error during sign-up'));
        next(error);
    }
});
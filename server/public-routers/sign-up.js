// NPM PACKAGES
import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import debug from 'debug';
const debugUser = debug('app:user');
const debugError = debug('app:error');

// CUSTOM MODULES/MIDDLEWARES
import User from '../models/user.js';
import userInstanceSchema from '../joi-schema-validator/userInstanceSchema.js';

// POST - USER SIGN-UP
router.post('/user', async (req, res, next) => {
    // if user not exists, create a new user
    try {
        const userExist = await User.findOne({
            $or: [
                { email: req.body.email }, 
                { employeeID: req.body.employeeID }
            ]});

        if (userExist) {
            if (userExist.email === req.body.email) return res.status(400).send(`Email is already registered.`);
            if (userExist.employeeID === req.body.employeeID) return res.status(400).send(`EmployeeID is already registered.`);
        }

        // validate required user input
        const { error } = userInstanceSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const details = error.details;
            const message = details.map( err => err.message );
            return res.status(400).send(message);
        }

        // hash password, and save user information to the datebase
        let user = new User(req.body);
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS, 10));
        user.password = await bcrypt.hash(user.password, salt);
        const token = user.getVerificationToken(req.body.email);
        user.verificationToken = token;
        user = await user.save();
       
        // store user email and which endpoint it's coming from
        const newUser = {
            email: req.body.email,
            fromMethod: req.method,
            fromUrl: req.originalUrl,
            verificationToken: token
        };

        req.session.newUser = newUser;
        debugUser('User successfully registered');
        debugUser('Sending email verification...')
        res.redirect('/api/new/email-send');
        // res.status(201).send(_pick(user, [...userKeys, '_id']));
    } catch (error) {
        req.session.destroy(err => {
            if (err) {
                debugError('Error destroying session:', err);
                return res.status(500).send('Error during sign-up');  // Handle any errors
            }
        });
        next(error);
    }
});

export default router;
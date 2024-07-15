// NPM PACKAGES
const express = require('express');
const router = express.Router();
const { User, validateUser } = require('../models/user');
const _pick = require('lodash.pick');
const bcrypt = require('bcrypt');
const debugUser = require('debug')('app:user');

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
        const { error } = validateUser(req.body);
        if (error) {
            const details = error.details;
            const message = details.map( err => err.message );
            return res.status(400).send(message);
        }

        // hash password, and save user information to the datebase
        let user = new User(_pick(req.body, [...userKeys, 'email', 'password']));
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS, 10));
        user.password = await bcrypt.hash(user.password, salt);
        user = await user.save();

        const token = user.getVerificationToken();
        user.verificationToken = token;
        user = await user.save();

       

        // create a token for the user to authenticate access to the application
        // const token = user.generateAuthToken();
        // res.cookie('x-auth-token', token, {
        //     httpOnly: true,
        //     secure: false,
        //     sameSite: 'lax'
        // });
       
        // store user email and which endpoint it's coming from
        req.session.email = req.body.email;
        req.session.fromMethod = req.method;
        req.session.fromUrl = req.originalUrl
        req.session.verificationToken = token;
  
        debugUser('User successfully registered');
        res.redirect('/api/new/user/google/auth');
        // res.status(201).send(_pick(user, [...userKeys, '_id']));
    } catch (error) {
        next(error);
    }
});

module.exports = router;
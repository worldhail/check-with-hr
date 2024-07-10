const express = require('express');
const router = express.Router();
const { User, validateUser } = require('../models/user');
const _pick = require('lodash.pick');
const bcrypt = require('bcrypt');
const { oAuth2GrantAccess } = require('../services/sendMail');
const debugMail = require('debug')('app:mail');

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

router.post('/sign-up', async (req, res, next) => {
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

        const { error } = validateUser(req.body);
        if (error) {
            const details = error.details;
            const message = details.map( err => err.message );
            return res.status(400).send(message);
        }

        let user = new User(_pick(req.body, [...userKeys, 'email', 'password']));
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS, 10));
        user.password = await bcrypt.hash(user.password, salt);
        // user = await user.save()
        
        // const token = user.generateAuthToken();
        
        
        debugMail('authUrl: ', oAuth2GrantAccess);
        res.redirect(oAuth2GrantAccess);

        // res.cookie('x-auth-token', token, {
        //     httpOnly: true,
        //     secure: false,
        //     sameSite: 'lax',
        //     maxAge: 3600000
        // });
        
        // res.status(201).send(_pick(user, [...userKeys, '_id']));
        
    } catch (error) {
        next(error);
    }
});

module.exports = router;
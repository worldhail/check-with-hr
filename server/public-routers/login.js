// NPM PACKAGES
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');
const debugUser = require('debug')('app:user');

// CUSTOM MODULES/MIDDLEWARES
const { User } = require('../models/user');

// POST - USER LOGIN
router.post('/user', async (req, res, next) => {
    // validate user credentials
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // if user exist, compare password then autheniticates
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user.role !== req.body.role) return res.status(400).send('Invalid email or password');
        if (!user) return res.status(400).send('Invalid email or password');

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).send('Invalid email or password');
        
        // // create a token for the user
        const token = user.generateAuthToken();
        res.cookie('x-auth-token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });

        const to_roleHomePage = user.role === 'admin' ? '/api/admin/profile' : '/api/user/profile';
        debugUser('Login successfully to', to_roleHomePage);
        res.redirect(to_roleHomePage);
    } catch (error) {
        next(error);
    }
});

// VALIDATE LOGIN DETAILS ON THEIR FORMAT
function validateUser (user) {
    const authSchema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().min(8).max(255).alphanum().required(),
        role: Joi.string().valid('admin', 'employee').required()
    });

    const result = authSchema.validate(user, { abortEarly: false });
    return result;
}

module.exports = {
    login: router,
    validateUserAccount: validateUser
}
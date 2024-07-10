const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { User } = require('../models/user');
const bcrypt = require('bcrypt');
const debugUser = require('debug')('app:user');

router.post('/login', async (req, res, next) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send('Invalid email or password');

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).send('Invalid email or password');
        
        const token = user.generateAuthToken();
        
        res.cookie('x-auth-token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 3600000
        });

        debugUser('Login successfully');
        res.redirect('/api/user/profile');
    } catch (error) {
        next(error);
    }
});

function validateUser (user) {
    const authSchema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().min(8).max(255).alphanum().required()
    });

    const result = authSchema.validate(user, { abortEarly: false });
    return result;
}

module.exports = {
    login: router,
    validateUserAccount: validateUser
}
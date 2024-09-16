// NPM PACKAGES
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const debugUser = require('debug')('app:user');

// CUSTOM MODULES/MIDDLEWARES
const User = require('../models/user');
const authLoginSchema = require('../joi-schema-validator/authLoginSchema');

// POST - USER LOGIN
router.post('/user', async (req, res, next) => {
    // validate user credentials
    const { error } = authLoginSchema.validate(req.body, { abortEarly: false });
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

        // const to_roleHomePage = user.role === 'admin' ? '/api/admin/profile' : '/api/user/profile';
        debugUser('Login successfully to', user.role);
        res.redirect('/api/account-routes/profile');
    } catch (error) {
        next(error);
    }
});

module.exports = router;
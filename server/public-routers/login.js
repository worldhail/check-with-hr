// NPM PACKAGES
import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import debug from 'debug';
const debugUser = debug('app:user');

// CUSTOM MODULES/MIDDLEWARES
import User from '../models/user.js';
import authLoginSchema from '../joi-schema-validator/authLoginSchema.js';

// POST - USER LOGIN
router.post('/user', async (req, res) => {
    // validate user credentials
    const { error } = authLoginSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).send(error.details[0].message);

    // if user exist, compare password then autheniticates
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password');
    if (user.role !== req.body.role) return res.status(400).send('Invalid email or password');

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
});

export default router;
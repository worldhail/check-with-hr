// NPM PACKAGES
import debug from 'debug';
const debugUser = debug('app:user');

// CUSTOM MODULES/MIDDLEWARES
import getUser from '../services/getUser.js';
import comparePassword from '../services/comparePassword.js';

// POST - USER LOGIN
export default async (req, res) => {
    // if user exist, compare password then autheniticates
    const authorizedUser = await getUser({ email: req.body.email });
    if (!authorizedUser) return res.status(400).send('Invalid email or password');
    if (authorizedUser.role !== req.body.role) return res.status(400).send('Invalid email or password');

    const isValidPassword = await comparePassword(req.body.password, authorizedUser.password);
    if (!isValidPassword) return res.status(400).send('Invalid email or password');
    
    // // create a token for the user
    const token = authorizedUser.generateAuthToken();
    res.cookie('x-auth-token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
    });

    debugUser('...Logging in to ', authorizedUser.role);
    res.redirect('/api/account-routes/profile');
};
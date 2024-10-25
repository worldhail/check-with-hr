// NPM PACKAGES
import express from 'express';
const router = express.Router();
import axios from 'axios';
import debug from 'debug';
const debugMail = debug('app:mail');
const debugError = debug('app:error');

// CUSTOM MODULES/MIDDLEWARES
import Token from '../models/googleToken.js';
import sendEmailVerification from './sendEmailVerification.js';
import activeSession from '../utils/activeSession.js';
import createOAuth2Client from './oAuth2Client.js';
const oAuth2Client = createOAuth2Client();

// GLOBAL VARIABLES
let { newUser } = {}; // store user email and which endpoint it's coming from

// GRANT ACCESSS TO OAUTH2 CLIENT
router.get('/user/google/auth', (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        // scope: ['https://www.googleapis.com/auth/gmail.send'],
        scope: ['https://mail.google.com/'],
        prompt: 'consent'
    });

    debugMail('Granted access to google oAuth', authUrl);
    res.redirect(authUrl);
});

// REDIRECT URI AFTER GOOGLE GRANT ACCESS FOR GMAIL API
router.get('/user/oauth2callback', async (req, res, next) => {
    try {
        // generate tokens, this happens only if there's no token saved on the database
        const { code } = req.query;
        const response = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: process.env.REDIRECT_URI,
            grant_type: 'authorization_code',
        });

        // sett oAuth2Client credentials | save tokens to the DB | send email verification
        const token = response.data;
        debugMail('New token obtained');

        const obtainedToken = new Token(token);
        // obtainedToken.expires_in = new Date(Date.now() + (token.expires_in * 1000));
        await obtainedToken.save();
        debugMail('Stored new token');

        oAuth2Client.setCredentials(token);
        debugMail('Setting credentials with oAuth');

        await sendEmailVerification(newUser, token);
        req.session.destroy(activeSession('Error during oAuthCallback'));
        debugMail('Session removed');

        res.send('Awesome! Please check your email and verify to complete your account.');
    } catch (error) {
        req.session.destroy(activeSession('Error during oAuthCallback'));
        debugError('Session removed \nFrom redirect URI')
        next(error);
    }
});

// SENDS EMAIL VERIFICATION IF TOKEN ARE SAVED IN THE DATABASE, ELSE IT WILL ASK FOR GRANT ACCESS WITH GOOGLE API
router.get('/email-send', async (req, res) => {
    newUser = req.session.newUser;

    let hasToken = await Token.findOne().select('-_id -__v');
    if (!hasToken) res.redirect('/api/new/user/google/auth');
    else {
        let statusCode = 200;
        let message = 'Awesome! Please check your email and verify to complete your account.';
        // if token found on DB, send email verification
        debugMail('Setting credentials with oAuth');
        oAuth2Client.setCredentials(hasToken);

        // if sendEmailVerification has an error,
        // it typically has expired refresh token so we redirect to google Auth to grant new tokens
        try {
            debugMail('Sending email verification');
            const isEmailSent = await sendEmailVerification(newUser, hasToken);
            if (isEmailSent === undefined) {
                statusCode = 500;
                message = 'Failed to send an email verification!';
            }
        } catch (error) {
            debugError('sendEmailVerification has an error. \nRequesting to Google oAuth ', error);
            res.redirect('/api/new/user/google/auth');
        }
        req.session.destroy(err => activeSession(err, 'Error during sending email verification'));
        debugError('Session removed');
        res.status(statusCode).send(message);
    };
});

export default router;
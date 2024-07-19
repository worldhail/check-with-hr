// NPM PACKAGES
const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const axios = require('axios');
const nodeMailer = require('nodemailer');
const debugMail = require('debug')('app:mail');

// CUSTOM MODULES/MIDDLEWARES
const Token = require('../models/googleToken');

// GLOBAL VARIABLES
let { newUser } = {}; // store user email and which endpoint it's coming from
const oAuth2Client = new google.auth.OAuth2( // define OAuth2 requirements a generate an auth URL
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

// GRANT ACCESSS TO OAUTH2 CLIENT
router.get('/user/google/auth', (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        // scope: ['https://www.googleapis.com/auth/gmail.send'],
        scope: ['https://mail.google.com/'],
        prompt: 'consent'
    });

    debugMail(authUrl);
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
        oAuth2Client.setCredentials(token);
        const obtainedToken = new Token(token);
        await obtainedToken.save();
        await sendEmailVerification(newUser.email, token);
        req.session.destroy();
        res.send('Awesome! Please check your email and verify to complete your account.');
    } catch (error) {
        req.session.destroy();
        next(error);
    }
});

// SENDS EMAIL VERIFICATION IF TOKEN ARE SAVED IN THE DATABASE, ELSE IT WILL ASK FOR GRANT ACCESS WITH GOOGLE API
router.get('/email-send', async (req, res, next) => {
    newUser = req.session.newUser;
    try {
        let hasToken = await Token.findOne().select('-_id -__v');
        if (!hasToken) res.redirect('/api/new/user/google/auth');
        else {
            // if token found on DB, send email verification
            oAuth2Client.setCredentials(hasToken);
            await sendEmailVerification(newUser.email, hasToken);
            req.session.destroy();
            res.send('Awesome! Please check your email and verify to complete your account.');
        };
    } catch (error) {
        req.session.destroy();
        next(error);
    }
});
async function sendEmailVerification(recipientEmail, savedToken) {
    try {
        // if there's refresh token saved, check if it's expired
        let token = savedToken.access_token;
        const isAccessTokenExpired = Date.now >= new Date(savedToken.expires_in);
        if (isAccessTokenExpired) {
            const response = await axios.post('https://oauth2.googleapis.com/token', {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                refresh_token: savedToken.refresh_token,
                grant_type: 'refresh_token',
            });

            const obtainedToken = response.data;
            token = obtainedToken.access_token
            const updateToken = await Token.updateOne({}, { $set: { obtainedToken } });
            debugMail('New access token obtained', updateToken);
            oAuth2Client.setCredentials(obtainedToken);
        };

        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.USER_EMAIL,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: savedToken.refresh_token,
                accessToken: token,
            }
        });
            
        const mailOptions = {
            from: process.env.USER_EMAIL,
            to: recipientEmail,
            subject: 'Check with HR - Email Verification',
            text: 'Thank you for signing up with us.',
            html:`<p><a href="http://localhost:20244/api/verify/user/complete?token=${newUser.verificationToken}">Please verify your email address by clicking this link.</a></p>`
        };
            
        const info = await transporter.sendMail(mailOptions);
        debugMail('Email sent: %s', info);
    } catch (error) {
        debugMail('Error sending email', error);
    }
};

module.exports = router;
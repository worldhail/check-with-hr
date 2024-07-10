const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const nodeMailer = require('nodemailer');
const debugMail = require('debug')('app:mail');
const Token = require('../models/googleToken');
const axios = require('axios');

// GRANT ACCESSS TO OAUTH2 CLIENT
const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);   

const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send']
    // scope: ['https://mail.google.com/'],
    // prompt: 'consent'
});

// Google redirects to the redirect URI with an authorization code
router.get('/user/oauth2callback', async (req, res, next) => {
    try {
        let token = await Token.findOne();
        if (!token) {   // if no value, exchange authorization code for access and refresh tokens
            const { code } = req.query;
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);

            const obtainedToken = new Token({ refreshToken: tokens.refresh_token });
            await obtainedToken.save();
        };

        if (token) oAuth2Client.setCredentials({ refresh_token: token.refreshToken});
        // const test = await oAuth2Client.getAccessToken();

        sendVerificationEmail('worldhail41@gmail.com');
        res.send('Authentication successful! You can close this window.');
    } catch (error) {
        next(error);
    }
});

// router.get('/user/oauth2callback', async (req, res, next) => {
//     try {
//         // let token = await Token.findOne();
//         // if (!token) {   // if no value, exchange authorization code for access and refresh tokens
//             const { code } = req.query;
//             const response = await axios.post('https://oauth2.googleapis.com/token', {
//                 code,
//                 client_id: process.env.CLIENT_ID,
//                 client_secret: process.env.CLIENT_SECRET,
//                 redirect_uri: process.env.REDIRECT_URI,
//                 grant_type: 'authorization_code',
//             });

//             const obtainedToken = new Token({ refreshToken: response.data.refresh_token });
//             await obtainedToken.save();
//         // };

//         const tokens = response.data;
//         sendVerificationEmail('worldhail41@gmail.com', tokens.access_token);
//         // Store tokens and redirect or respond as needed
//         res.send('Please check your email for verification link.');
//     } catch (error) {
//         next(error);
//     }
// });

async function sendVerificationEmail(recipientEmail) {
    try {
        const token = await oAuth2Client.getAccessToken();
        const { refreshToken } = await Token.findOne()
        const currentDate = Date.now();
        const expiryDate = new Date(token.res.data.expiry_date);
        if (currentDate >= expiryDate) debugMail('Token expired!');
        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.USER_EMAIL,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken,
                accessToken: token.token,
            }
        });

        const mailOptions = {
            from: process.env.USER_EMAIL,
            to: recipientEmail,
            subject: 'Check with HR - Email Verification',
            text: 'Thank you for signing up with us.',
            html: '<p><a href="http://localhost:20244/api/user/profile">Please verify your email address by clicking this link.</a></p>'
        };

        const info = await transporter.sendMail(mailOptions);
        debugMail('Email sent: %s', info);
    } catch (error) {
        debugMail('Could not send email: %s', error);
    }
};

module.exports = {
    sendMail: router,
    oAuth2GrantAccess: authUrl
};
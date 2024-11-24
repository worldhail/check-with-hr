import axios from 'axios';
import Token from '../models/googleToken.js';
import mailOptions from './mailOptions.js';
import createTransporter from './createTransporter.js';
import createOAuth2Client from './oAuth2Client.js';
import debug from 'debug';
const oAuth2Client = createOAuth2Client();
const debugMail = debug('app:mail');
const debugError = debug('app:error');

export default async function (newUser, savedToken) {
    try {
        // if there's refresh token saved, check if it's expired
        let token = savedToken.access_token;
        const isAccessTokenExpired = Date.now() >= savedToken.expires_in;

        if (isAccessTokenExpired) {
            debugMail('Access token expired. Getting new token')
            try {
                const response = await axios.post('https://oauth2.googleapis.com/token', {
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET,
                    refresh_token: savedToken.refresh_token,
                    grant_type: 'refresh_token',
                });
    
                let obtainedToken = response.data;
                debugMail('New access token obtained');

                obtainedToken.expires_in = new Date(Date.now() + (obtainedToken.expires_in * 1000));
                token = obtainedToken.access_token
                const updateToken = await Token.updateOne({}, { $set: obtainedToken });
                debugMail('Stored new access token ', updateToken);

                oAuth2Client.setCredentials(obtainedToken);
                debugMail('Setting credentials with oAuth');
            } catch (error) {
                debugError('From expired token ', error.response.data);
            }
        };

        const transporter = createTransporter(savedToken.refresh_token, token);
        const mailOption = mailOptions(newUser.email, newUser.verificationToken);
            
        const sentInfo = await transporter.sendMail(mailOption);
        debugMail('Email sent: %s', sentInfo);
        return sentInfo;
    } catch (error) {
        debugMail('Error sending email', error);
    }
};
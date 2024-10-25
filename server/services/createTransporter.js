import nodemailer from 'nodemailer';

export default (refreshToken, accessToken) => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.USER_EMAIL,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: refreshToken,
            accessToken: accessToken,
        }
    });
};
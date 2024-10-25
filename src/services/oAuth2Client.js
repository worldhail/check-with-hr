import { google } from 'googleapis';

export default () => {
    return new google.auth.OAuth2( // define OAuth2 requirements a generate an auth URL
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI
    );
};
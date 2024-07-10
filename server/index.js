require('dotenv').config();
const path = require('path');
const envFile = path.join(__dirname, `../.env.${process.env.NODE_ENV}`);
require('dotenv').config({ path: envFile });
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const mongoose = require('mongoose');
const user = require('./protected-routers/users');
const auth = require('./middleware/auth');
const { login } = require('./public-routers/login');
const signUp = require('./public-routers/sign-up');
const { sendMail } = require('./services/sendMail');
const debug = require('debug')('app:error');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/user', auth, user);
app.use('/api/users', login);
app.use('/api/users', signUp);
app.use('/api/verify', sendMail);

(async function connecToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected with MongoDB...');
    } catch (error) {
        debug('Could not connect to MongoDB...', error);
    }
})();

app.use((err, req, res, next) => {
    debug(err.message);
    res.status(500).send('Server Error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Listening on port ${PORT}`) });
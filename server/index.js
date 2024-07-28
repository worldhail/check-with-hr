// NPM PACKAGES
const path = require('path');
require('dotenv').config();
const envFile = path.join(__dirname, `../.env.${process.env.NODE_ENV}`);
require('dotenv').config({ path: envFile });
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const helmet = require('helmet');
const mongoose = require('mongoose');
const debug = require('debug')('app:error');

// CUSTOM MODULES/MIDDLEWARES
const { adminLimiter, userLimiter, verificationLimiter } = require('./middleware/requestLimiter');
const authorizeRole = require('./middleware/authorizeRole');
const user = require('./protected-user-routers/users');
const auth = require('./middleware/auth');
const { login } = require('./public-routers/login');
const signUp = require('./public-routers/sign-up');
const sendMail = require('./services/sendMail');
const verifiedEmail = require('./services/verifiedEmail');
const adminUser = require('./protected-admin-routers/adminUser');
const adminLookUp = require('./protected-admin-routers/adminLook-up');

// MIDDLEWARES
app.use(helmet());
app.use(session({
    secret: process.env.JWT_PRIVATE_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/sign-up', signUp);
app.use('/api/new', sendMail);
app.use('/api/verify', verificationLimiter, verifiedEmail);
app.use('/api/login', login);
app.use('/api/user', userLimiter, auth, authorizeRole(['employee']), user);
app.use('/api/admin', adminLimiter, auth, authorizeRole(['admin']), adminUser);

// CONNECT TO MONGODB
(async function connecToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected with MongoDB...');
    } catch (error) {
        debug('Could not connect to MongoDB...', error);
    }
})();

// ERROR HANDLING
app.use((err, req, res, next) => {
    debug(err);
    res.status(500).send('Server Error');
});

// LISTEN TO PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Listening on port ${PORT}`) });
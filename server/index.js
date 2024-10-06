// NPM PACKAGES
import dotenv from 'dotenv';
import path, { join } from 'path';
const __dirname = path.dirname(new URL(import.meta.url).pathname);
dotenv.config({ path: join(__dirname, `../.env.${process.env.NODE_ENV}`) });
import express from 'express';
const app = express();
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoose from 'mongoose';
import debug from 'debug';
const debugError = debug('app:error')

//STARTUPS
import './startup/logging.js';

// CUSTOM MODULES/MIDDLEWARES
import { adminLimiter, userLimiter, verificationLimiter } from './middleware/requestLimiter.js';
import authorizeRole from './middleware/authorizeRole.js';
import auth from './middleware/auth.js';
import login from './public-routers/login.js';
import signUp from './public-routers/sign-up.js';
import sendMail from './services/sendMail.js';
import verifiedEmail from './services/verifiedEmail.js';
import adminLookUp from './protected-admin-routers/adminLook-up.js';
import userCredits from './protected-user-routers/leave-credits.js';
import payslip from './protected-admin-routers/payslip.js';
import accountRoutes from './protected-shared-routers/accountRoutes.js';
import error from './middleware/error.js';

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
app.use('/api/user', userLimiter, auth, authorizeRole(['employee']), userCredits);
app.use('/api/admin', adminLimiter, auth, authorizeRole(['admin']), adminLookUp);
app.use('/api/admin', adminLimiter, auth, authorizeRole(['admin']), payslip);
app.use('/api/account-routes', userLimiter, auth, authorizeRole(['admin', 'employee']), accountRoutes);
app.use(error);

// CONNECT TO MONGODB
(async function connecToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected with MongoDB...');
    } catch (error) {
        debugError('Could not connect to MongoDB...', error);
    }
})();

// LISTEN TO PORT
debug(process.env)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Listening on port ${PORT}`) });
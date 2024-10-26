// NPM PACKAGES
import express from 'express';
const router = express.Router();

// CUSTOM MODULES/MIDDLEWARES
import { googleAuth, oauth2Callback, sendEmail } from '../controllers/sendMailController.js';

// GRANT ACCESSS TO OAUTH2 CLIENT
router.get('/user/google/auth', googleAuth);
router.get('/user/oauth2callback', oauth2Callback);
router.get('/email-send', sendEmail);

export default router;
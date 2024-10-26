// NPM PACKAGES
import express from 'express';
const router = express.Router();

// CUSTOM MODULES/MIDDLEWARES
import verifyEmailController from '../controllers/verifyEmailController.js';

// TAGGED AS VERIFIED EMAIL ADDRESS ONCE VISITED THIS ROUTE
export default router.get('/user/complete', verifyEmailController);
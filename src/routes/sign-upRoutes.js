// NPM PACKAGES
import express from 'express';
const router = express.Router();

// CUSTOM MODULES/MIDDLEWARES
import signUpController from '../controllers/sign-upController.js';

// POST - USER SIGN-UP
export default router.post('/user', signUpController);
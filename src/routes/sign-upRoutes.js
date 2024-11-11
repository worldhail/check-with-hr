// NPM PACKAGES
import express from 'express';
const router = express.Router();

// CUSTOM MODULES/MIDDLEWARES
import signUpController from '../controllers/sign-upController.js';
import validate from '../middleware/validate.js';
import userInstanceSchema from '../joi-schema-validator/userInstanceSchema.js';

// POST - USER SIGN-UP
export default router.post('/user', validate(userInstanceSchema), signUpController);
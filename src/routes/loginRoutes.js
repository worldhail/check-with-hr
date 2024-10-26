// NPM PACKAGES
import express from 'express';
const router = express.Router();

// CUSTOM MODULES/MIDDLEWARES
import authLoginSchema from '../joi-schema-validator/authLoginSchema.js';
import validate from '../middleware/validate.js';
import loginController from '../controllers/loginController.js';

// POST - USER LOGIN
export default router.post('/user', validate(authLoginSchema), loginController);
// NPM PACKAGES
import express from 'express';
const router = express.Router();
import leaveCreditsController from '../controllers/leaveCreditsController.js';

export default router.get('/leave-credits', leaveCreditsController);
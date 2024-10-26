import signUpRoutes from './sign-upRoutes.js';
import sendMailRoutes from './sendMailRoutes.js';
import { verificationLimiter, userLimiter, adminLimiter } from '../middleware/requestLimiter.js';
import verifyEmailRoutes from './verifyEmailRoutes.js';
import loginRoutes from './loginRoutes.js';
import auth from '../middleware/auth.js';
import leaveCreditsRoutes from './leaveCreditsRoutes.js';
import authorizeRole from '../middleware/authorizeRole.js';
import adminLookUpRoutes from './adminLookUpRoutes.js';
import payslipRoutes from './payslipRoutes.js';
import accountRoutes from './accountRoutes.js';
import express from "express";
const router = express.Router();

router.use('/api/sign-up', signUpRoutes);
router.use('/api/new', sendMailRoutes);
router.use('/api/verify', verificationLimiter, verifyEmailRoutes);
router.use('/api/login', loginRoutes);
router.use('/api/user', userLimiter, auth, authorizeRole(['employee']), leaveCreditsRoutes);
router.use('/api/admin', adminLimiter, auth, authorizeRole(['admin']), adminLookUpRoutes);
router.use('/api/admin', adminLimiter, auth, authorizeRole(['admin']), payslipRoutes);
router.use('/api/account-routes', userLimiter, auth, authorizeRole(['admin', 'employee']), accountRoutes);

export default router;
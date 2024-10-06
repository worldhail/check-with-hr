// NPM PACKAGES
import express from 'express';
const router = express.Router();

// CUSTOMER MODULES/MIDDLEWARES
import LeaveCredits from '../models/leave-credits.js';

router.get('/leave-credits', async (req, res) => {
    const userCredits = await LeaveCredits.findOne({ user: req.user._id }); 
    res.send(userCredits);
});

export default router;
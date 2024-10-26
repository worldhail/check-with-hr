import getLeaveCredits from '../services/getLeaveCredits.js';

export default async (req, res) => {
    const userCredits = await getLeaveCredits(req.user._id);
    if (!userCredits) return res.status(404).send('No leave credits or regularization date added');
    res.send(userCredits);
};
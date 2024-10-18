import LeaveCredits from '../models/leave-credits.js';

export default (id, { used, available }) => {
    return LeaveCredits.updateOne({ user: id }, { $set: { used, available } });
};
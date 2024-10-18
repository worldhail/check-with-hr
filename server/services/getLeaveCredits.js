import LeaveCredits from '../models/leave-credits.js';

export default id => LeaveCredits.findOne({ user: id });
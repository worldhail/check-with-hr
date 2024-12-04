import LeaveCredits from "../models/leave-credits.js";

export default function(id, obj) {
    const { regularizationDate, used } = obj;

    return LeaveCredits.findOneAndReplace(
        { user: id },
        { user: id, regularizationDate, used },
        { new: true, upsert: true }
    );
};
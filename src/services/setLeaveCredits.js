import LeaveCredits from "../models/leave-credits.js";
import ClientError from "./customError.js";

export default function(id, obj) {
    const { regularizationDate, used } = obj;

    const userCredits = LeaveCredits.findOneAndReplace(
        { user: id },
        { user: id, regularizationDate, used },
        { new: true, upsert: true }
    );

    if (!userCredits) throw new ClientError(400, 'Fail to set the leave credits');

    return userCredits;
};
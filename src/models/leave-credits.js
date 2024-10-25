import mongoose from 'mongoose';
import numberOfMonths from '../services/numberOfMonths.js';

const leaveCreditSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    regularizationDate: { type: Date, required: true },
    available: Number,
    used: { type: Number, default: 0 },
    total: Number
});

leaveCreditSchema.pre('findOneAndReplace', function (next) {
    const newData = this.getUpdate();
    newData.used ??= 0;

    const months = numberOfMonths(newData);
    newData.total = months;
    newData.available = newData.total - newData.used;
    next();
});

export default mongoose.model('LeaveCredits', leaveCreditSchema);

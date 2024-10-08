import mongoose from 'mongoose';

const leaveCreditSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    regularizationDate: { type: Date, required: true },
    available: Number,
    used: { type: Number, default: 0 },
    total: Number
});

leaveCreditSchema.pre('save', function (next) {
    const timeDifference = new Date() - this.regularizationDate;
    const days = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
    const months = Math.floor(days / 30);
    this.total = months;
    this.available = this.total - this.used;
    next();
});

export default mongoose.model('LeaveCredits', leaveCreditSchema);

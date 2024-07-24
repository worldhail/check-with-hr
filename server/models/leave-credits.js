const mongoose = require('mongoose');

const leaveCreditSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    regularizationDate: { type: Date, required: true },
    available: { type: Number, default: 0, required: true },
    used: { type: Number, default: 0, required: true },
    total: { type: Number, default: 0, required: true }
});

leaveCreditSchema.pre('save', function (next) {
    try {
        const timeDifference = this.regularizationDate - new Date();
        const days = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
        const months = Math.floor(days / 30);
        this.available = this.total - this.used;
        this.total = months;
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('LeaveCredits', leaveCreditSchema);

import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    access_token: { type: String, required: true },
    expires_in: { type: Date, required: true },
    refresh_token: { type: String, required: true },
    scope: { type: String, required: true },
    token_type: { type: String, required: true }
})

tokenSchema.pre('save', function(next) {
    const expiration = new Date(Date.now() + (this.expires_in * 1000));
    this.expires_in = expiration;
    next();
});

export default mongoose.model('Token', tokenSchema)

// NEED RESOLUTION FOR MULTIPLE REQUEST FROM THE USER
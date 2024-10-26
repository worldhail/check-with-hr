import mongoose from "mongoose";
import debug from "debug";
const debugError = debug('app:error');

export default async function connecToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected with MongoDB...');
    } catch (error) {
        debugError('Could not connect to MongoDB...', error);
    }
};
import mongoose from "mongoose";

const hourType = new mongoose.Schema({
    name: { type: String, required: true },
    ratePerHour: { type: Number, required: true }
},  { _id: false });

const hourTypeSchema = new mongoose.Schema({
    hourTypes: { type: [ hourType ], required: true }
});

export default mongoose.model('HourType', hourTypeSchema);
import HourType from '../models/hourType.js';
import getHourType from '../services/getHourType.js';
import mongoose from 'mongoose';
import debug from 'debug';
const debugAdmin = debug('app:admin');


export default async (req, res, next) => {
    const session = await mongoose.startSession();
    const { name, ratePerHour } = req.body.hourTypes;
    let addHourType;

    try {
        session.startTransaction();

        let hasDocument = await getHourType({}, { session });
        if (!hasDocument) {
            addHourType = new HourType({ hourTypes: { name, ratePerHour } });
            await addHourType.save({ session });
            await session.commitTransaction();
            return res.status(201).send(addHourType);
        };

        const hourType = hasDocument.hourTypes.map(type => type.name);
        if (hourType.includes(name)) {
            await session.abortTransaction();
            return res.status(400).send('Hour type already exist.');
        }

        addHourType = hasDocument.hourTypes.push({ name, ratePerHour });
        addHourType = await hasDocument.save({ session });
        
        await session.commitTransaction();

        debugAdmin('New hour type is added.');
        res.send(addHourType);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};
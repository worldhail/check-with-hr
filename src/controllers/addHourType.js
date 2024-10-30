import HourType from '../models/hourType.js';
import getHourType from '../services/getHourType.js';
import debug from 'debug';
const debugAdmin = debug('app:admin');

export default async (req, res) => {
    const { name, ratePerHour } = req.body.hourTypes;
    let addHourType;

    let hasDocument = await getHourType();
    if (!hasDocument) {
        addHourType = new HourType({ hourTypes: { name, ratePerHour } });
        await addHourType.save();
        return res.status(201).send(addHourType);
    };

    const hourType = hasDocument.hourTypes.map(type => type.name);
    if (hourType.includes(name)) return res.status(400).send('Hour type already exist.');

    addHourType = hasDocument.hourTypes.push({ name, ratePerHour });
    addHourType = await hasDocument.save();

    debugAdmin('New hour type is added.');
    res.send(addHourType);
};
import HourType from "../models/hourType.js";

export default (hourTypeName) => {
    const hourType = hourTypeName ?? null;
    return HourType.findOne(hourType);
};
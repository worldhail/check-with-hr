import HourType from "../models/hourType.js";

export default (hourTypeName = {}, options = {}) => {
    const result = HourType.findOne(hourTypeName);

    if (options.session) result.session(options.session);
    return result;
};
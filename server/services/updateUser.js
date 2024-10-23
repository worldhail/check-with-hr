import User from "../models/user.js";

export default (query, newData, options) => {
    return User.updateOne(query, { $set: newData }, options ?? null);
};
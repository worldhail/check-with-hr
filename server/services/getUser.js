import User from "../models/user.js";

export default (query, options) => {
    let propNames = null;
    
    if (options === '/profile') {
        propNames = '-_id -password -date -role -isVerified -verificationToken -__v ';
    };

    return User.findOne(query).select(propNames);
};
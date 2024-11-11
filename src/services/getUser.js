import User from "../models/user.js";

export default (query, options = {}) => {
    let propNames = null;
    
    if (options.url === '/profile') {
        propNames = '-_id -password -date -role -isVerified -verificationToken -__v ';
    };

    const result = User.findOne(query);
    if (propNames) result.select(propNames);
    if (options.session) result.session(options.session);

    return result;
};
// NPM PACKAGES
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');

// USER SCHEMA - FORMAT OF THE USER INPUT
const userSchema = new mongoose.Schema({
    employeeID: { type: String, required: true, unique: true },
    firstName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: String, trim: true, required: true },
    position: { type: String, trim: true, required: true },
    hireDate: { type: Date, required: true },
    address: {
        street: { type: String, trim: true, required: true },
        barangay: { type: String, trim: true, required: true },
        city: { type: String, trim: true, required: true },
        province: { type: String, trim: true, required: true },
        zipCode: { type: String, trim: true, required: true }
    },
    tenurity: {
        years: Number,
        months: Number
    },
    employmentStatus: { type: String, trim: true, required: true },
    isVerified: { type: Boolean, default: false},
    verificationToken: { type: String },
    date: { type: Date, default: Date.now },
    role: { type: String, required: true, enum: [ 'admin', 'employee'] }
});
// SCHEMA METHODS
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_PRIVATE_KEY);
    return token;
};
userSchema.methods.getVerificationToken = function (newEmail) {
    const token = jwt.sign({ email: newEmail, role: this.role }, process.env.JWT_PRIVATE_KEY, { expiresIn: 900000 });
    return token;
};


// JOI SCHEMA VALIDATOR
function validateUser (user) {
    const user_Schema = Joi.object({
        employeeID: Joi.string().alphanum().min(5).max(55).required(),
        firstName: Joi.string().min(2).max(55).required(),
        lastName: Joi.string().min(2).max(55).required(),
        email: Joi.string().min(5).max(55).required().email(),
        password: Joi.string().min(8).max(255).alphanum().required(),
        department: Joi.string().min(5).max(55).required(),
        position: Joi.string().min(2).max(55).required(),
        hireDate: Joi.date().iso().required(),
        address: {
            street: Joi.string().min(3).max(55).required(),
            barangay: Joi.string().min(3).max(55).required(),
            city: Joi.string().min(3).max(55).required(),
            province: Joi.string().min(3).max(55).required(),
            zipCode: Joi.string().min(2).max(55).required(),
        },
        employmentStatus: Joi.string().min(5).max(55).required(),
        role: Joi.string().valid('admin', 'employee').required()
    });

    const result = user_Schema.validate(user, { abortEarly: false });
    return result;
};

// CALCULATE THE HIRE DATE INTO THE NUMBER OF MONTHS, AND YEARS
function getTenurity (date) {
    const currentDate = new Date();

    // Calculate the difference in milliseconds
    const timeDifference = currentDate - date;

    // Convert milliseconds to years and months
    const years = Math.floor(timeDifference / (365 * 24 * 60 * 60 * 1000));
    const months = Math.floor((timeDifference % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000));
    return { years, months };
}

// BEFORE SAVING THE USER INFO, TENURITY WILL BE CALCULATED AND STORED AS AN OBJECT
userSchema.pre('save', function (next) {
    try {
        const { years, months } = getTenurity(this.hireDate);
        this.tenurity = { years, months };
        next();
    } catch(err) {
        next(err);
    }
});

//DEFINING USER MODEL
const User = mongoose.model('User', userSchema);

module.exports = {
    getTenurity,
    User,
    validateUser
}
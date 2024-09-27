// NPM PACKAGES
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// CUSTOMER MODULES/MIDDLEWARES
const getTenurity = require('../utils/getTenurity');

// USER SCHEMA - FORMAT OF THE USER INPUT
const userSchema = new mongoose.Schema({
    employeeID: { type: String, required: true, unique: true },
    firstName: { type: String, trim: true, required: true },
    middleName: { type: String, trim: true, required: true },
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

// BEFORE SAVING THE USER INFO, TENURITY WILL BE CALCULATED AND STORED AS AN OBJECT
userSchema.pre('save', function (next) {
    const { years, months } = getTenurity(this.hireDate);
    this.tenurity = { years, months };
    next();
});

userSchema.index({
    employeeID: 1,
    firstName: 1,
    middleName: 1,
    lastName: 1,
    email: 1,
    department: 1,
    position: 1,
    hireDate: 1,
    employmentStatus: 1 
},
{ collation: { locale: 'en', strength: 2 } });

//DEFINING USER MODEL
const User = mongoose.model('User', userSchema);
User.ensureIndexes();

module.exports = User;
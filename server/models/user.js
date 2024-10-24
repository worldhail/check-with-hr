// NPM PACKAGES
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// CUSTOMER MODULES/MIDDLEWARES
import getTenurity from '../utils/getTenurity.js';
import makeSessionDataWith from '../services/makeSessionDataWith.js'

// USER SCHEMA - FORMAT OF THE USER INPUT
const userSchema = new mongoose.Schema({
    employeeID: { type: String, required: true, unique: true },
    firstName: { type: String, trim: true, required: true },
    middleName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
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
    const token = this.getVerificationToken(this.email);

    this.tenurity = { years, months };
    this.verificationToken = token;
    next();
});

userSchema.pre('updateOne', function (next) {
    const options = this.options;
    let req, token;
    
    if (options.hasOwnProperty('req') && options.hasOwnProperty('token')) {
        req = options.req;
        token = options.token;

        // store user email and which endpoint it's coming from
        req.session.newUser = makeSessionDataWith(req, token);
    };

    if (options.hasOwnProperty('from')) {
        const newData = this.getUpdate();
        const date = new Date(newData.$set.hireDate);
        newData.$set.tenurity = getTenurity(date);
    }
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

export default User;
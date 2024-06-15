const Joi = require('joi');
const { validateUserAccount } = require('./auth');
const express = require('express');
const router = express.Router();
const { User, validateUser, getTenurity } = require('../models/user');
const _pick = require('lodash.pick');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

//USER PROPERTIES
const userKeys = [
    'employeeID',
    'firstName', 
    'lastName',
    'department',
    'position',
    'hireDate',
    'address',
    'employmentStatus'
];

//SIGN UP
router.post('/', async (req, res) => {
    const email = await User.findOne({ email: req.body.email });
    const employeeID = await User.findOne({ employeeID: req.body.employeeID });
    
    if (email) res.status(400).send(`Email is already registered.`);
    if (employeeID) res.status(400).send(`EmployeeID is already registered.`);

    const { error } = validateUser(req.body);
    if (error) {
        const details = error.details;
        const message = details.map( err => err.message );
        return res.status(400).send(message);
    }

    let user = new User(_pick(req.body, [...userKeys, 'email', 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user = await user.save()
    
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_pick(user, [...userKeys, '_id']));
});

//GET
router.get('/', auth, async (req, res) => {
    const profile = await User.findById(req.user._id).select('-_id -password -date');
    res.send(profile);
});

//MODIFICATIONS - VIEW/MODIFY ACOUNT
router.put('/account', auth, async (req, res) => {
    const { error } = validateUserAccount(req.body);
    if (error) {
        const details = error.details;
        const message = details.map( err => err.message );
        return res.status(400).send(message);
    };

    let { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    const authorizeUser = await User.findOne({ _id: req.user._id });
    if (existingUser && authorizeUser.email !== existingUser.email) res.status(400).send(`Email is already registered.`);

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    password = hash;
    
    const updatedUser = await User.updateOne({ _id: req.user._id }, { $set: { email, password }});
    res.send(updatedUser)
});

//MODIFICATIONS - UPDATE OTHER INFO
router.put('/info', auth, async (req, res) => {
    const { error } = validateOtherInfo(req.body);
    if (error) {
        const details = error.details;
        const message = details.map( err => err.message );
        return res.status(400).send(message);
    };

    const existingUser = await User.findOne({ employeeID: req.body.employeeID });
    const authorizeUser = await User.findOne({ _id: req.user._id });
    if (existingUser && authorizeUser.employeeID !== existingUser.employeeID) res.status(400).send(`EmployeeID is already registered.`);
    
    const date = new Date(req.body.hireDate);
    await User.updateOne({ _id: req.user._id }, { $set: { tenurity: getTenurity(date) }})
    const updateUser = await User.updateOne({ _id: req.user._id }, _pick(req.body, userKeys));
    res.send(updateUser);
});
 
//VALIDATOR FOR USER INFO MODIFICATION
function validateOtherInfo (user) {
    const userSchema = Joi.object({
        employeeID: Joi.string().alphanum().min(5).max(55).required(),
        firstName: Joi.string().min(2).max(55).required(),
        lastName: Joi.string().min(2).max(55).required(),
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
        employmentStatus: Joi.string().min(5).max(55).required()
    });

    const result = userSchema.validate(user, { abortEarly: false });
    return result;
};

//DELETE REQUEST
router.delete('/account', auth, async (req, res) => {
    const deleteMyAccount = await User.deleteOne({ _id: req.user._id });
    res.send(deleteMyAccount);
});

module.exports = router;
// NPM PACKAGES
const express = require('express');
const router = express.Router();

// CUSTOMER MODULES/MIDDLEWARES
const { User } = require('../models/user');

// GET EMPLOYEE DOCUMENTS
router.get('user-documents', async (req, res, next) => {
    // req body for user categories
    const {
        employeeID,
        firstName,
        middleName,
        lastName,
        department,
        hireDate,
        employmentStatus
    } = req.body
    
    const { error } = userCategorySchema(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const user = await User.find(req.body);
        if (!user) return res.status(400).send('No results found');

        res.send(user);
    } catch (error) {
        next(error);
    }
});

// USER CATEGORY SCHEMA
function userCategorySchema (userInfo) {
    const userDocumentSchema = Joi.object({
        employeeID: Joi.string().alphanum().max(55),
        firstName: Joi.string().max(55),
        middleName: Joi.string().max(55),
        lastName: Joi.string().max(55),
        department: Joi.string().max(55),
        hireDate: Joi.date().iso(),
        employmentStatus: Joi.string().min(5).max(55),
    });

    const result = userDocumentSchema.validate(userInfo);
    return result;
}
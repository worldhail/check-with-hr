// NPM PACKAGES
const express = require('express');
const router = express.Router();
const Joi = require('joi');

// CUSTOMER MODULES/MIDDLEWARES
const { User } = require('../models/user');

// GET EMPLOYEE DOCUMENTS
router.get('/user-documents', async (req, res, next) => {
    // validate the new input from the request body
    const { error } = userCategorySchema(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const queries = [];

        // Seaches every key pairs to ensure documents are retrieved
        for (let keys in req.body) {
            if (req.body[keys] === '') return res.status(400).send('Remove or add search to all empty categories');

            queries.push(User.find({ [keys]: req.body[keys] })
                .select('employeeID firstName middleName lastName department hireDate employmentStatus')
                .collation({ locale: 'en', strength: 2 }));
        };

        if (queries.length === 0) return res.status(400).send('No search parameters setup');

        // making sure every key pair document results must not be duplicated
        const result = (await Promise.all(queries)).flat();
        const documents = Array.from(new Set(result.map(obj => obj._id.toString())))
            .map(id => result.find(obj => obj._id.toString() === id));
        
        res.send(documents);
    } catch (error) {
        next(error);
    }
});

// USER CATEGORY SCHEMA
function userCategorySchema (userInfo) {
    const userDocumentSchema = Joi.object({
        employeeID: Joi.string().alphanum().max(55).allow(''),
        firstName: Joi.string().max(55).allow('').insensitive(),
        middleName: Joi.string().max(55).allow(''),
        lastName: Joi.string().max(55).allow(''),
        department: Joi.string().max(55).allow(''),
        hireDate: Joi.date().iso().allow(''),
        employmentStatus: Joi.string().min(5).max(55).allow(''),
    });

    const result = userDocumentSchema.validate(userInfo);
    return result;
}

module.exports = router;
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { User } = require('../models/user');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password');

    res.send('Logged in');
});

function validateUser (user) {
    const authSchema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().max(255).required()
    });

    const result = authSchema.validate(user, { abortEarly: false });
    return result;
}

module.exports.auth = router;
module.exports.validateUserAccount = validateUser;

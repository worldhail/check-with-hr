import User from "../models/user.js";
import userObjectIdSchema from '../joi-schema-validator/userObjectIdSchema.js';

export default function () {
    return async (req, res, next) => {
        const id = req.params.id;
        const { error } = userObjectIdSchema.validate({ 'Employee': { user: id }});
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(id);
        if (!user) return res.status(400).send('User not found');
        next();
    }
};
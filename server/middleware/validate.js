export default function (schema) {
    return (req, res, next) => {
        const { value, error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const message = error.details.map(err => err.message);
            return res.status(400).send(message);
        };

        req.body = value;
        next();
    };
};
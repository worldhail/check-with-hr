import jwt from 'jsonwebtoken';

export default function (req, res, next) {
    const token = req.cookies['x-auth-token'];
    if (!token) return res.status(401).send('Access denied. Something is wrong.');

    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = decoded;
    next();
}
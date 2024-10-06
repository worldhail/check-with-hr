// NPM PACKAGES
import rateLimit from 'express-rate-limit';

// RATE LIMITER CONFIGURATION
const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests attempted, please try again later'
});

const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: 'Too many requests attempted, please try again later'
});

const verificationLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many requests attempted, please try again later'
});

export { userLimiter, adminLimiter, verificationLimiter };
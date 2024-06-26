require('dotenv').config();
const path = require('path');
const envFile = path.join(__dirname, `../.env.${process.env.NODE_ENV}`);
require('dotenv').config({ path: envFile });
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const mongoose = require('mongoose');
const user = require('./protected-routers/users');
const { login } = require('./public-routers/login');
const signUp = require('./public-routers/sign-up');
const authToken = require('./middleware/auth');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/user', authToken, user);
app.use('/api/users', login);
app.use('/api/users', signUp);

(async function connecToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected with MongoDB...');
    } catch (error) {
        console.error('Could not connect to MongoDB...', error);
    }
})();

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Listening on port ${PORT}`) });
require('dotenv').config();
const path = require('path');
const envFile = path.join(__dirname, `../.env.${process.env.NODE_ENV}`);
require('dotenv').config({ path: envFile });
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const mongoose = require('mongoose');
const user = require('./routers/users');
const { auth } = require('./routers/auth');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/users', user);
app.use('/api/auth', auth);

(async function connecToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected with MongoDB...');
    } catch (error) {
        console.error('Could not connect to MongoDB...', error);
    }
})();

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).send('Server Error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Listening on port ${PORT}`) });
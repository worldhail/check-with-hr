const express = require('express');
const app = express();
const mongoose = require('mongoose');
const user = require('./routers/users');
const { auth } = require('./routers/auth');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/users', user);
app.use('/api/auth', auth);

async function connecToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected with MongoDB...');
    } catch (error) {
        console.error('Could not connect to MongoDB...', error);
    }
}

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    connecToDB();
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Listening on port ${PORT}`) });
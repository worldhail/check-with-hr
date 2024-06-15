const express = require('express');
const app = express();
const mongoose = require('mongoose');
const user = require('./routers/users');
const { auth } = require('./routers/auth');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/users', user);
app.use('/api/auth', auth);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected with MongoDB...'))
    .catch((error) => console.error('Could not connect to MongoDB...', error));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Listening on port ${PORT}`) });
const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
    // Disable query buffering so disconnected DB fails fast instead of timing out.
    mongoose.set('bufferCommands', false);

    if (!process.env.MONGO_URL) {
        throw new Error('MONGO_URL is missing in environment variables');
    }

    await mongoose.connect(process.env.MONGO_URL, {
        dbName: process.env.DB_NAME,
        serverSelectionTimeoutMS: 15000,
    });

    mongoose.connection.on('disconnected', () => {
        console.error('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err.message);
    });

    console.log('Connected to database');
}

module.exports = connectDB;
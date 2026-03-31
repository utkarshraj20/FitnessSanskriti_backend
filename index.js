const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = 8000;
const cookieParser = require('cookie-parser');

const authRoutes = require('./Routes/Auth');
const calorieIntakeRoutes = require('./Routes/CalorieIntake');
const adminRoutes = require('./Routes/Admin');
const imageUploadRoutes = require('./Routes/imageUploadRoutes');
const sleepTrackRoutes = require('./Routes/SleepTrack');
const stepTrackRoutes = require('./Routes/StepTrack');
const weightTrackRoutes = require('./Routes/WeightTrack');
const waterTrackRoutes = require('./Routes/WaterTrack');
const workoutTrackRoutes = require('./Routes/WorkoutTrack');
const workoutRoutes = require('./Routes/WorkoutPlans');
const reportRoutes = require('./Routes/Report');
const chatRoutes = require('./Routes/Chat');
const { startDailyReminderScheduler } = require('./Services/dailyReminderScheduler');


require('dotenv').config();
const connectDB = require('./db');

app.use(bodyParser.json());
const allowedOrigins = [
    'http://localhost:3000',
    'https://fitnesssanskriti.netlify.app',
]; // Add more origins as needed

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
)
app.use(cookieParser());

app.use((req, res, next) => {
    // If DB is down, fail fast instead of letting Mongoose operations buffer and timeout.
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            ok: false,
            message: 'Database connection unavailable. Please try again.',
        });
    }
    return next();
});


app.use('/auth', authRoutes);
app.use('/calorieintaketrack', calorieIntakeRoutes);
app.use('/admin', adminRoutes);
app.use('/image-upload', imageUploadRoutes);
app.use('/sleeptrack', sleepTrackRoutes);
app.use('/stepstrack', stepTrackRoutes);
app.use('/weighttrack', weightTrackRoutes);
app.use('/watertrack', waterTrackRoutes);
app.use('/workouttrack', workoutTrackRoutes);
app.use('/workoutplans', workoutRoutes);
app.use('/report', reportRoutes);
app.use('/chat', chatRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'The API is working' });
});


async function startServer() {
    try {
        await connectDB();
        startDailyReminderScheduler();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect database. Server not started.', err.message);
        process.exit(1);
    }
}

startServer();

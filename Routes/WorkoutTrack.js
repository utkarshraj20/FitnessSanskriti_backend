const express = require('express');
const router = express.Router();
const authTokenHandler = require('../Middlewares/checkAuthToken');
const errorHandler = require('../Middlewares/errorMiddleware');

const{
    addWorkoutEntryHandler,
    GetWorkoutsByDateHandler,
    GetWorkoutsByLimitHandler,
    DeleteWorkoutEntryHandler,
    GetUserGoalWorkoutHandler
} = require('../Controllers/WorkoutTrack')

router.post('/addworkoutentry', authTokenHandler, addWorkoutEntryHandler);

router.post('/getworkoutsbydate', authTokenHandler, GetWorkoutsByDateHandler);

router.post('/getworkoutbylimit', authTokenHandler, GetWorkoutsByLimitHandler);

router.delete('/deleteworkoutentry', authTokenHandler, DeleteWorkoutEntryHandler);

router.get('/getusergoalworkout', authTokenHandler, GetUserGoalWorkoutHandler);

router.use(errorHandler);

module.exports = router;
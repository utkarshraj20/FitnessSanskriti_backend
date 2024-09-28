const express = require('express');
const router = express.Router();

const authTokenHandler = require('../Middlewares/checkAuthToken');
const errorHandler = require('../Middlewares/errorMiddleware');
const User = require('../Models/UserSchema');

const {
    AddSleepEntryHandler,
    GetSleepByDateHandler,
    GetSleepByLimitHandler,
    DeleteSleepEntryHandler,
    GetGoalSleepHandler
} = require('../Controllers/SleepTrack');

router.post('/addsleepentry', authTokenHandler, AddSleepEntryHandler);

router.post('/getsleepbydate', authTokenHandler, GetSleepByDateHandler);

router.post('/getsleepbylimit', authTokenHandler, GetSleepByLimitHandler);

router.delete('/deletesleepentry', authTokenHandler, DeleteSleepEntryHandler);

router.get('/getusersleep', authTokenHandler, GetGoalSleepHandler);

router.use(errorHandler);

module.exports = router;
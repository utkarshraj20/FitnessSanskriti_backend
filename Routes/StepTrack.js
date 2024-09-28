const express = require('express');
const router = express.Router();
const authTokenHandler = require('../Middlewares/checkAuthToken');
const errorHandler = require('../Middlewares/errorMiddleware');

const {
    AddStepEntryHandler,
    GetStepsByDateHandler,
    GetStepsByLimitHandler,
    DeleteStepEntryHandler,
    GetUserGoalStepsHandler
} = require('../Controllers/StepTrack');


router.post('/addstepentry', authTokenHandler, AddStepEntryHandler);

router.post('/getstepsbydate', authTokenHandler, GetStepsByDateHandler);

router.post('/getstepsbylimit', authTokenHandler, GetStepsByLimitHandler);

router.delete('/deletestepentry', authTokenHandler, DeleteStepEntryHandler);

router.get('/getusergoalsteps', authTokenHandler, GetUserGoalStepsHandler);

router.use(errorHandler);

module.exports = router;
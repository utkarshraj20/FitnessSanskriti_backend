const express = require('express');
const router = express.Router();
const authTokenHandler = require('../Middlewares/checkAuthToken');
const errorHandler = require('../Middlewares/errorMiddleware');

const {
    AddWeightEntryHandler,
    GetWeightByDateHandler,
    GetWeightByLimitHandler,
    DeleteWeightEntryHandler,
    GetUserGoalWeightHandler
} = require('../Controllers/WeightTrack')

router.post('/addweightentry', authTokenHandler, AddWeightEntryHandler);

router.post('/getweightbydate', authTokenHandler, GetWeightByDateHandler);

router.post('/getweightbylimit', authTokenHandler, GetWeightByLimitHandler);

router.delete('/deleteweightentry', authTokenHandler, DeleteWeightEntryHandler);


router.get('/getusergoalweight', authTokenHandler, GetUserGoalWeightHandler);

router.use(errorHandler);

module.exports = router;
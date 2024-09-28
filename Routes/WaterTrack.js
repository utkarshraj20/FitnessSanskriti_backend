const express = require('express');
const router = express.Router();
const authTokenHandler = require('../Middlewares/checkAuthToken');
const errorHandler = require('../Middlewares/errorMiddleware');

const{
    AddWaterEntryHandler,
    GetWaterByDateHandler,
    GetWaterByLimitHandler,
    DeleteWaterEntryHandler,
    GetGoalWaterHandler
} = require('../Controllers/WaterTrack');

router.post('/addwaterentry', authTokenHandler, AddWaterEntryHandler);

router.post('/getwaterbydate', authTokenHandler, GetWaterByDateHandler);

router.post('/getwaterbylimit', authTokenHandler, GetWaterByLimitHandler);

router.delete('/deletewaterentry', authTokenHandler, DeleteWaterEntryHandler);

router.get('/getusergoalwater', authTokenHandler, GetGoalWaterHandler);

router.use(errorHandler);

module.exports = router;
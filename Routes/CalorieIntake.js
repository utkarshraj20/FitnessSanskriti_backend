const express = require('express');
const router = express.Router();
const authTokenHandler = require('../Middlewares/checkAuthToken');
const errorHandler = require('../Middlewares/errorMiddleware');

const {
    AddCalorieIntakeHandler,
    GetCalorieIntakeByDateHandler,
    GetCalorieIntakeByLimitHandler,
    DeleteCalorieIntakeHandler,
    GetGoalCalorieIntakeHandler
} = require('../Controllers/CalorieIntake')

router.get('/test', authTokenHandler, async (req, res) => {
    res.json(createResponse(true, 'Test API works for calorie intake report'));
});

router.post('/addcalorieintake', authTokenHandler, AddCalorieIntakeHandler)

router.post('/getcalorieintakebydate', authTokenHandler, GetCalorieIntakeByDateHandler)

router.post('/getcalorieintakebylimit', authTokenHandler, GetCalorieIntakeByLimitHandler)

router.delete('/deletecalorieintake', authTokenHandler, DeleteCalorieIntakeHandler)

router.get('/getgoalcalorieintake', authTokenHandler, GetGoalCalorieIntakeHandler)

module.exports = router;
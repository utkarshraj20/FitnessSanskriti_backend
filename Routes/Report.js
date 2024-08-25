const express = require('express');
const router = express.Router();
const authTokenHandler = require('../Middlewares/checkAuthToken');
const errorHandler = require('../Middlewares/errorMiddleware');
const {GetReportHandler} = require('../Controllers/Report')
const createResponse = require('../Utils/Response')


router.get('/test', authTokenHandler, async (req, res) => {
    res.status(200).json(createResponse(true, 'Test API works for report'));
});

router.get('/getreport', authTokenHandler, GetReportHandler);

module.exports = router;

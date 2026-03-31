const express = require('express');
const router = express.Router();
const authTokenHandler = require('../Middlewares/checkAuthToken');
const errorHandler = require('../Middlewares/errorMiddleware');
const { AskChatbotHandler } = require('../Controllers/Chat');

router.post('/ask', authTokenHandler, AskChatbotHandler);

router.use(errorHandler);

module.exports = router;

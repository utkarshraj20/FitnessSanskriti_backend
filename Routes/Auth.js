const express = require('express');
const router = express.Router();
const errorHandler = require('../Middlewares/errorMiddleware');
const authTokenHandler = require('../Middlewares/checkAuthToken');

const {
    RegisterHandler,
    LoginHandler,
    CheckLoginHandler,
    SendOtpHandler
} = require('../Controllers/Auth')


router.get('/test', async (req, res) => {
    res.json({
        message: "Auth api is working"
    })
})

router.post( '/register' , RegisterHandler);

router.post('/login' , LoginHandler);

router.post('/sendotp' , SendOtpHandler)

router.post('/checklogin', authTokenHandler, CheckLoginHandler)

router.use(errorHandler)

module.exports = router;
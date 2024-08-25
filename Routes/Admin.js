const express = require('express');
const router = express.Router();
const errorHandler = require('../Middlewares/errorMiddleware');
const adminTokenHandler = require('../Middlewares/checkAdminToken');

const {
    RegisterHandler,
    LoginHandler,
    CheckLoginHandler
} = require('../Controllers/Admin')

router.post('/register', RegisterHandler);

router.post('/login', LoginHandler);

router.get('/checklogin', adminTokenHandler, CheckLoginHandler);

router.use(errorHandler)

module.exports = router;
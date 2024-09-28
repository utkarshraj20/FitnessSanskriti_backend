const createResponse = require('../Utils/Response')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../Models/UserSchema');

// rnrb cfyp wvyp nquk
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'utkarshmahiyan@gmail.com',
        pass: 'rnrbcfypwvypnquk'
    }
})

async function RegisterHandler( req , res , next ){
    try{
        const { name, email, password, weightInKg, heightInCm, gender, dob, goal, activityLevel } = req.body;
        const existingUser = await User.findOne({ email: email });
        if( existingUser ){
            return res.status(409).json(createResponse(false, 'Email already exists'));
        }
        const newUser = new User({
            name,
            password,
            email,
            weight: [
                {
                    weight: weightInKg,
                    unit: "kg",
                    date: Date.now()
                }
            ],
            height: [
                {
                    height: heightInCm,
                    date: Date.now(),
                    unit: "cm"
                }
            ],
            gender,
            dob,
            goal,
            activityLevel
        });
        await newUser.save(); // Await the save operation

        res.status(201).json(createResponse(true, 'User registered successfully'));
    }
    catch(err){
        next(err);
    }
}

async function LoginHandler(req, res, next) {
    try{
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json(createResponse(false, 'Invalid credentials'));
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json(createResponse(false, 'Invalid credentials'));
        }
        
        const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '50m' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '100m' });

        res.cookie('authToken', authToken, { httpOnly: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true });
        res.status(200).json(createResponse(true, 'Login successful', {
            authToken,
            refreshToken
        }));
    }
    catch(err){
        next(err)
    }
}

async function LogoutHandler(req, res) {
    res.cookie('authToken', '', { httpOnly: true, expires: new Date(0) });
    res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
    
    return res.json({ ok: true, message: 'Logged out successfully' });
}

async function CheckLoginHandler(req, res, next) {
    res.json({
        ok: true,
        message: 'User authenticated successfully'
    })
}

async function SendOtpHandler(req, res) {
    try{
        const {email} = req.body ;
        const otp = Math.floor( 100000 + Math.random()*900000 ) ;

        const mailOptions = {
            from: 'utkarshmahiyan@gmail.com',
            to: email,
            subject: 'OTP for verification',
            text: `Your OTP is ${otp}`
        }
        transporter.sendMail(mailOptions, async (err, info) => {
            if (err) {
                console.log(err);
                res.status(500).json(createResponse(false, err.message));
            } else {
                res.json(createResponse(true, 'OTP sent successfully', { otp }));
            }
        });
    }
    catch(err){
        next(err) ;
    }
}

module.exports = {RegisterHandler, LoginHandler, CheckLoginHandler, SendOtpHandler, LogoutHandler}

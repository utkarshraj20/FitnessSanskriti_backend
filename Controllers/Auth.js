const createResponse = require('../Utils/Response')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../Models/UserSchema');
const EmailOtp = require('../Models/EmailOtpSchema');

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
        const { name, email, password, weightInKg, heightInCm, gender, dob, goal, activityLevel, otp } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if( existingUser ){
            return res.status(409).json(createResponse(false, 'Email already exists'));
        }
        if (!otp) {
            return res.status(400).json(createResponse(false, 'Please provide the email verification OTP'));
        }

        const otpRecord = await EmailOtp.findOne({ email: normalizedEmail });
        if (!otpRecord) {
            return res.status(400).json(createResponse(false, 'Please request an OTP first'));
        }

        if (otpRecord.expiresAt.getTime() < Date.now()) {
            await EmailOtp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json(createResponse(false, 'OTP expired. Please request a new one'));
        }

        const isOtpValid = await bcrypt.compare(String(otp), otpRecord.otpHash);
        if (!isOtpValid) {
            return res.status(400).json(createResponse(false, 'Invalid OTP'));
        }

        const newUser = new User({
            name,
            password,
            email: normalizedEmail,
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
        await EmailOtp.deleteOne({ _id: otpRecord._id });

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

        res.cookie('authToken', authToken, { httpOnly: true , secure: true, sameSite: 'None' });
        res.cookie('refreshToken', refreshToken, { httpOnly: true , secure: true, sameSite: 'None'  });
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

async function GetProfileHandler(req, res, next) {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json(createResponse(false, 'User not found'));
        }

        const latestWeight = user.weight[user.weight.length - 1] || null;
        const latestHeight = user.height[user.height.length - 1] || null;
        const latestSleep = user.sleep[user.sleep.length - 1] || null;
        const latestSteps = user.steps[user.steps.length - 1] || null;
        const latestWater = user.water[user.water.length - 1] || null;
        const latestWorkout = user.workouts[user.workouts.length - 1] || null;

        const profile = {
            name: user.name,
            email: user.email,
            gender: user.gender,
            dob: user.dob,
            goal: user.goal,
            activityLevel: user.activityLevel,
            joinedAt: user.createdAt,
            totals: {
                calorieEntries: user.calorieIntake.length,
                sleepEntries: user.sleep.length,
                stepEntries: user.steps.length,
                waterEntries: user.water.length,
                workoutEntries: user.workouts.length,
                weightEntries: user.weight.length,
            },
            latestStats: {
                weightInKg: latestWeight ? latestWeight.weight : null,
                heightInCm: latestHeight ? latestHeight.height : null,
                sleepInHrs: latestSleep ? latestSleep.durationInHrs : null,
                steps: latestSteps ? latestSteps.steps : null,
                waterInMl: latestWater ? latestWater.amountInMilliliters : null,
                workout: latestWorkout
                    ? {
                        exercise: latestWorkout.exercise,
                        durationInMinutes: latestWorkout.durationInMinutes,
                        date: latestWorkout.date,
                    }
                    : null,
            },
        };

        return res.json(createResponse(true, 'Profile fetched successfully', profile));
    } catch (err) {
        next(err);
    }
}

async function UpdateProfileHandler(req, res, next) {
    try {
        const { name, gender, dob, goal, activityLevel, weightInKg, heightInCm } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json(createResponse(false, 'User not found'));
        }

        if (!name || !gender || !dob || !goal || !activityLevel) {
            return res.status(400).json(createResponse(false, 'Please provide all required profile details'));
        }

        user.name = name;
        user.gender = gender;
        user.dob = dob;
        user.goal = goal;
        user.activityLevel = activityLevel;

        if (weightInKg !== undefined && weightInKg !== null && weightInKg !== "") {
            const parsedWeight = Number(weightInKg);
            const latestWeight = user.weight[user.weight.length - 1];

            if (!Number.isNaN(parsedWeight) && (!latestWeight || Number(latestWeight.weight) !== parsedWeight)) {
                user.weight.push({
                    weight: parsedWeight,
                    date: new Date(),
                });
            }
        }

        if (heightInCm !== undefined && heightInCm !== null && heightInCm !== "") {
            const parsedHeight = Number(heightInCm);
            const latestHeight = user.height[user.height.length - 1];

            if (!Number.isNaN(parsedHeight) && (!latestHeight || Number(latestHeight.height) !== parsedHeight)) {
                user.height.push({
                    height: parsedHeight,
                    date: new Date(),
                });
            }
        }

        await user.save();

        return res.json(createResponse(true, 'Profile updated successfully'));
    } catch (err) {
        next(err);
    }
}

async function SendOtpHandler(req, res) {
    try{
        const normalizedEmail = String(req.body?.email || '').trim().toLowerCase();
        if (!normalizedEmail) {
            return res.status(400).json(createResponse(false, 'Please provide an email'));
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json(createResponse(false, 'Email already exists'));
        }

        const otp = Math.floor( 100000 + Math.random()*900000 ) ;
        const otpHash = await bcrypt.hash(String(otp), 8);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        const mailOptions = {
            from: process.env.COMPANY_EMAIL || 'utkarshmahiyan@gmail.com',
            to: normalizedEmail,
            subject: 'OTP for verification',
            text: `Your OTP is ${otp}. It is valid for 5 minutes.`
        }
        transporter.sendMail(mailOptions, async (err) => {
            if (err) {
                console.log(err);
                res.status(500).json(createResponse(false, err.message));
            } else {
                await EmailOtp.findOneAndUpdate(
                    { email: normalizedEmail },
                    { email: normalizedEmail, otpHash, expiresAt },
                    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
                );

                res.json(createResponse(true, 'OTP sent successfully. It is valid for 5 minutes.'));
            }
        });
    }
    catch(err){
        next(err) ;
    }
}

module.exports = {RegisterHandler, LoginHandler, CheckLoginHandler, GetProfileHandler, UpdateProfileHandler, SendOtpHandler, LogoutHandler}

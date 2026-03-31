const mongoose = require('mongoose');

const emailOtpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        otpHash: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 },
        },
    },
    { timestamps: true }
);

const EmailOtp = mongoose.model('EmailOtp', emailOtpSchema);

module.exports = EmailOtp;

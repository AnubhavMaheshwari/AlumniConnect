const User = require('../models/User');
const Verification = require('../models/Verification');
const generateOTP = require('../utils/otpGenerator');
const sendEmail = require('../utils/sendEmail');
const admin = require('firebase-admin');

// @desc    Send Email OTP
// @route   POST /api/auth/send-email-otp
exports.sendEmailOTP = async (req, res) => {
    try {
        const { email } = req.body || {};
        const normalizedEmail = (email || '').trim().toLowerCase();

        if (!normalizedEmail) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store or update OTP in Verification collection
        await Verification.findOneAndUpdate(
            { identifier: normalizedEmail },
            { otp, expiresAt },
            { upsert: true, new: true }
        );

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #4F46E5; text-align: center;">Verify Your Email</h2>
                <p>Hello,</p>
                <p>Your verification code for Alumni Connect is:</p>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; border-radius: 8px; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="font-size: 12px; color: #6b7280; text-align: center;">Alumni Connect - Connecting NIT JSR Alumni</p>
            </div>
        `;

        await sendEmail({
            email: normalizedEmail,
            subject: 'Email Verification - Alumni Connect',
            html
        });

        res.json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email-otp
exports.verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const verification = await Verification.findOne({ identifier: email, otp });

        if (!verification || verification.expiresAt < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // OTP is valid. Now update the user if they exist
        let user = await User.findOne({ email });
        if (user) {
            user.isEmailVerified = true;
            await user.save({ validateBeforeSave: false });
        }

        // Remove verification record
        await Verification.deleteOne({ _id: verification._id });

        res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Phone OTP (Firebase ID Token)
// @route   POST /api/auth/verify-phone-otp
exports.verifyPhoneOTP = async (req, res) => {
    try {
        const { idToken, phone } = req.body;

        // Verify the ID token sent from the client
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const phoneNumber = decodedToken.phone_number;

        // Check if phone numbers match (optional but recommended)
        // Note: Firebase phone numbers are in E.164 format
        
        let user = req.user ? await User.findById(req.user.id) : await User.findOne({ phone });

        if (!user) {
             return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.phone = phoneNumber || phone;
        user.isPhoneVerified = true;
        await user.save({ validateBeforeSave: false });

        res.json({ success: true, message: 'Phone verified successfully', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

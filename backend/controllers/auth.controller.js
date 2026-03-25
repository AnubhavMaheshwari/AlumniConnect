const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { logActivity } = require('./activity.controller');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, graduationYear, department, phone, company, yearsOfExperience, country, zipCode } = req.body;
        const registrationNumber = phone; // Registration number is phone number

        // Check if user exists (email)
        const userWithEmail = await User.findOne({ email });
        if (userWithEmail) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        // Check if user exists (phone/registrationNumber)
        const userWithPhone = await User.findOne({ phone });
        if (userWithPhone) {
            return res.status(400).json({ success: false, message: 'User with this phone number already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            graduationYear,
            department,
            phone,
            company,
            yearsOfExperience,
            country,
            zipCode,
            registrationNumber
        });

        const token = generateToken(user._id);

        // Log registration activity
        await logActivity(user._id, 'Welcome to the Alumni Portal! Your account has been created.', 'register');

        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                graduationYear: user.graduationYear,
                department: user.department,
                phone: user.phone,
                company: user.company,
                yearsOfExperience: user.yearsOfExperience,
                country: user.country,
                zipCode: user.zipCode
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        // Log login activity
        await logActivity(user._id, 'Logged in to your account.', 'login');

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                graduationYear: user.graduationYear,
                department: user.department,
                phone: user.phone,
                company: user.company,
                yearsOfExperience: user.yearsOfExperience
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'No user found with that email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const html = `
      <h1>Password Reset Request</h1>
      <p>You have requested a password reset for your Alumni Connect account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

        await sendEmail({
            email: user.email,
            subject: 'Alumni Connect - Password Reset',
            html
        });

        res.json({ success: true, message: 'Email sent' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        const token = generateToken(user._id);

        res.json({ success: true, token, message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password-otp
exports.resetPasswordWithOTP = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        const normalizedEmail = (email || '').trim().toLowerCase();

        if (!normalizedEmail || !otp || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email, OTP and new password' });
        }

        const Verification = require('../models/Verification');
        const verification = await Verification.findOne({ identifier: normalizedEmail, otp });

        if (!verification || verification.expiresAt < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.password = password;
        await user.save();

        // Remove verification record
        await Verification.deleteOne({ _id: verification._id });

        res.json({ success: true, message: 'Password reset successful. You can now login with your new password.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, resetPasswordWithOTP } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const { sendEmailOTP, verifyEmailOTP, verifyPhoneOTP, checkPhoneAvailable, sendForgotPasswordOTP } = require('../controllers/otp.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// OTP Routes
router.post('/send-email-otp', sendEmailOTP);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/verify-phone-otp', verifyPhoneOTP);
router.post('/check-phone', checkPhoneAvailable);

// OTP Password Reset
router.post('/send-forgot-password-otp', sendForgotPasswordOTP);
router.post('/reset-password-otp', resetPasswordWithOTP);

module.exports = router;

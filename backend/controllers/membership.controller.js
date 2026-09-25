const Membership = require('../models/Membership');
const User = require('../models/User');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Initialize Razorpay (mock or real)
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// @desc    Create membership order
// @route   POST /api/membership/order
exports.createOrder = async (req, res) => {
    try {
        const { plan } = req.body;
        let amount = 0;

        if (plan === 'premium') amount = 99900; // ₹999
        else if (plan === 'lifetime') amount = 499900; // ₹4999
        else return res.status(400).json({ success: false, message: 'Invalid plan' });

        if (!razorpay) {
            // Mocking order for development if no Razorpay keys
            const orderId = `order_mock_${Date.now()}`;
            return res.status(200).json({ 
                success: true, 
                order: { id: orderId, amount, currency: 'INR' },
                isMock: true
            });
        }

        const options = {
            amount,
            currency: 'INR',
            receipt: `receipt_${req.user.id}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify membership payment
// @route   POST /api/membership/verify
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment details missing' });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mock_secret')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment verified
            const startDate = new Date();
            const endDate = new Date();
            if (plan === 'premium') endDate.setFullYear(endDate.getFullYear() + 1);
            else if (plan === 'lifetime') endDate.setFullYear(endDate.getFullYear() + 100);

            const membership = await Membership.create({
                user: req.user.id,
                plan,
                status: 'active',
                startDate,
                endDate,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                amount: plan === 'premium' ? 999 : 4999
            });

            // Update user status
            await User.findByIdAndUpdate(req.user.id, { isPremium: true });

            res.status(200).json({ success: true, message: 'Membership activated!', membership });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user membership status
// @route   GET /api/membership/status
exports.getMembershipStatus = async (req, res) => {
    try {
        const membership = await Membership.findOne({ user: req.user.id, status: 'active' })
            .sort({ createdAt: -1 });

        if (!membership) {
            return res.json({ success: true, hasActiveMembership: false });
        }

        // Check if expired
        if (membership.endDate && new Date() > membership.endDate) {
            membership.status = 'expired';
            await membership.save();
            await User.findByIdAndUpdate(req.user.id, { isPremium: false });
            return res.json({ success: true, hasActiveMembership: false });
        }

        res.json({ success: true, hasActiveMembership: true, membership });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

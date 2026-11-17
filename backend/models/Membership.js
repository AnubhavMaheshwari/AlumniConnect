const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: String,
        enum: ['basic', 'premium', 'lifetime'],
        default: 'basic'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'inactive'
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    amount: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Membership', membershipSchema);

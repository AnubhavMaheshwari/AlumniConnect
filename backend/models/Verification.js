const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    identifier: {
        type: String, // email or phone
        required: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '10m' } // Automatically delete after 10m
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Verification', verificationSchema);

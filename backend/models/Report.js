const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        reportedMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            required: true
        },
        reason: {
            type: String,
            required: [true, 'Please provide a reason for reporting']
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'resolved'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);

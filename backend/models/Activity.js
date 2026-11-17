const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    text: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['login', 'register', 'profile_update', 'event_create', 'job_create', 'news_create'],
        default: 'profile_update'
    },
    isGlobal: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);

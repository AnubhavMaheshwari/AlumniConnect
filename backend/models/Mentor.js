const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    domain: [{
        type: String,
        required: [true, 'Please add at least one domain (e.g. DSA, ML, Web Dev)']
    }],
    experience: {
        type: Number,
        required: [true, 'Please add years of experience']
    },
    bio: {
        type: String,
        required: [true, 'Please add a mentor bio'],
        maxlength: 1000
    },
    type: {
        type: String,
        enum: ['free', 'paid'],
        default: 'free'
    },
    price: {
        type: Number,
        default: 0
    },
    availabilitySlots: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        time: String, // e.g., "18:00 - 19:00"
        isBooked: {
            type: Boolean,
            default: false
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Mentor', mentorSchema);

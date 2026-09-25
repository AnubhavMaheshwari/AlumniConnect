const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    date: {
        type: Date,
        required: [true, 'Please add a date']
    },
    endDate: {
        type: Date
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    type: {
        type: String,
        enum: ['reunion', 'workshop', 'seminar', 'networking', 'cultural', 'other'],
        default: 'other'
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    image: {
        type: String,
        default: ''
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    meetingLink: {
        type: String,
        default: ''
    },
    maxAttendees: {
        type: Number,
        default: 0
    },
    shortDescription: {
        type: String,
        maxlength: 200,
        default: ''
    },
    registrationType: {
        type: String,
        enum: ['free', 'paid'],
        default: 'free'
    },
    price: {
        type: Number,
        default: 0
    },
    registrationDeadline: {
        type: Date
    },
    attachments: [{
        type: String // Cloudinary URLs
    }],
    organizerContact: {
        name: String,
        email: String,
        phone: String
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);

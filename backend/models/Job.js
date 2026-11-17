const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true,
        maxlength: 100
    },
    company: {
        type: String,
        required: [true, 'Please add a company name'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    type: {
        type: String,
        enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'],
        default: 'full-time'
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    requirements: [{
        type: String
    }],
    salary: {
        type: String,
        default: 'Not disclosed'
    },
    applicationLink: {
        type: String,
        default: ''
    },
    applicationDeadline: {
        type: Date
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);

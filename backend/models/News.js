const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    summary: {
        type: String,
        maxlength: 300
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['achievement', 'announcement', 'story', 'update', 'other'],
        default: 'other'
    },
    tags: [{
        type: String
    }],
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('News', newsSchema);

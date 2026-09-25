const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    registrationNumber: {
        type: String,
        required: false,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    graduationYear: {
        type: Number
    },
    department: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        maxlength: 500
    },
    profileImage: {
        type: String,
        default: ''
    },
    linkedin: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        required: false,
        trim: true
    },
    skills: [{
        type: String
    }],
    currentPosition: {
        type: String,
        default: ''
    },
    company: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    yearsOfExperience: {
        type: Number,
        default: 0
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    location: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    zipCode: {
        type: String,
        trim: true
    },
    emailOTP: {
        type: String,
        select: false
    },
    emailOTPExpires: {
        type: Date,
        select: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['alumni', 'admin'],
        default: 'alumni'
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    banReason: {
        type: String,
        default: ''
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

// Indexes for fast querying
userSchema.index({ graduationYear: 1 });
userSchema.index({ department: 1 });
userSchema.index({ company: 1 });
userSchema.index({ location: 1 });
userSchema.index({ name: 'text', skills: 'text', company: 'text' });


// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

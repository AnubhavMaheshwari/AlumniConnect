const Activity = require('../models/Activity');

// @desc    Get user activities
// @route   GET /api/activity
// @access  Private
exports.getActivities = async (req, res) => {
    try {
        const now = new Date();
        const activities = await Activity.find({
            $and: [
                { $or: [{ user: req.user.id }, { isGlobal: true }] },
                { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }] }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            activities
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to log activity
exports.logActivity = async (userId, text, type, isGlobal = false, expiresAt = null) => {
    try {
        await Activity.create({
            user: isGlobal ? null : userId,
            text,
            type,
            isGlobal,
            expiresAt
        });
    } catch (error) {
        console.error('Error logging activity:', error.message);
    }
};

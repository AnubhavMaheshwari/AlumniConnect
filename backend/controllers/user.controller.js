const User = require('../models/User');

// @desc    Get all users (alumni directory)
// @route   GET /api/users
exports.getUsers = async (req, res) => {
    try {
        const { search, department, graduationYear, page = 1, limit = 12 } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { currentPosition: { $regex: search, $options: 'i' } },
                { skills: { $regex: search, $options: 'i' } }
            ];
        }

        if (department) {
            query.department = department;
        }

        if (graduationYear) {
            query.graduationYear = parseInt(graduationYear);
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
    try {
        const { name, bio, graduationYear, department, linkedin, phone, skills, currentPosition, company, location } = req.body;

        // Only allow user to update their own profile
        if (req.params.id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, bio, graduationYear, department, linkedin, phone, skills, currentPosition, company, location },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
    try {
        if (req.params.id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this profile' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

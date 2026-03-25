const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add new user
// @route   POST /api/admin/users
exports.addUser = async (req, res) => {
    try {
        const { name, email, password, department, graduationYear, phone, role } = req.body;
        const registrationNumber = phone; // Registration number is phone number

        // Check if user exists (email)
        const userWithEmail = await User.findOne({ email });
        if (userWithEmail) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        // Check if user exists (phone/registrationNumber)
        const userWithPhone = await User.findOne({ phone });
        if (userWithPhone) {
            return res.status(400).json({ success: false, message: 'User with this phone number already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            department,
            graduationYear,
            phone,
            registrationNumber,
            role: role || 'alumni'
        });

        res.status(201).json({
            success: true,
            message: 'User added successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                department: user.department,
                registrationNumber: user.registrationNumber,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Ban/Unban user
// @route   PATCH /api/admin/users/:id/ban
exports.toggleBanUser = async (req, res) => {
    try {
        const { banReason } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isBanned = !user.isBanned;
        user.banReason = user.isBanned ? banReason : '';
        await user.save();

        res.status(200).json({
            success: true,
            message: user.isBanned ? 'User banned successfully' : 'User unbanned successfully',
            user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get banned users
// @route   GET /api/admin/banned-users
exports.getBannedUsers = async (req, res) => {
    try {
        const users = await User.find({ isBanned: true }).select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['alumni', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Search users
// @route   GET /api/admin/users/search?q=query
exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ success: false, message: 'Search query required' });
        }

        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { department: { $regex: q, $options: 'i' } }
            ]
        }).select('-password');

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user statistics
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalAlumni = await User.countDocuments({ role: 'alumni' });
        const totalBanned = await User.countDocuments({ isBanned: true });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalAdmins,
                totalAlumni,
                totalBanned
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

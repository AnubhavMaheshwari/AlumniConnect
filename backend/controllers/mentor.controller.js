const Mentor = require('../models/Mentor');
const User = require('../models/User');

// @desc    Opt-in as a mentor
// @route   POST /api/mentors
exports.optInMentor = async (req, res) => {
    try {
        const { domain, experience, bio, type, price, availabilitySlots } = req.body;

        // Check if already a mentor
        let mentor = await Mentor.findOne({ user: req.user.id });
        if (mentor) {
            return res.status(400).json({ success: false, message: 'You are already a mentor' });
        }

        mentor = await Mentor.create({
            user: req.user.id,
            domain,
            experience,
            bio,
            type,
            price: type === 'paid' ? price : 0,
            availabilitySlots
        });

        res.status(201).json({ success: true, mentor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all mentors (with search and filters)
// @route   GET /api/mentors
exports.getMentors = async (req, res) => {
    try {
        const { domain, company, experience, type, search } = req.query;
        let query = { isActive: true };

        if (domain) query.domain = { $in: domain.split(',') };
        if (type) query.type = type;
        if (experience) query.experience = { $gte: parseInt(experience) };

        let mentors = await Mentor.find(query).populate({
            path: 'user',
            select: 'name email profileImage company department graduationYear'
        });

        // Filter based on company if provided (since it's in User model)
        if (company) {
            mentors = mentors.filter(m => m.user?.company?.toLowerCase().includes(company.toLowerCase()));
        }

        // Filter based on general search
        if (search) {
            mentors = mentors.filter(m => 
                m.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
                m.bio?.toLowerCase().includes(search.toLowerCase()) ||
                m.domain?.some(d => d.toLowerCase().includes(search.toLowerCase()))
            );
        }

        res.json({ success: true, count: mentors.length, mentors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single mentor
// @route   GET /api/mentors/:id
exports.getMentor = async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.id).populate('user', 'name email profileImage company department graduationYear linkedin');
        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }
        res.json({ success: true, mentor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update mentor profile
// @route   PUT /api/mentors/:id
exports.updateMentor = async (req, res) => {
    try {
        let mentor = await Mentor.findById(req.params.id);
        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        // Only mentor can update their own profile
        if (mentor.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
        }

        mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, mentor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete mentor profile
// @route   DELETE /api/mentors/:id
exports.deleteMentor = async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.id);
        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        if (mentor.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this profile' });
        }

        await Mentor.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Mentor removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

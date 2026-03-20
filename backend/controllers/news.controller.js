const News = require('../models/News');

// @desc    Get all news
// @route   GET /api/news
exports.getNews = async (req, res) => {
    try {
        const { category, page = 1, limit = 12 } = req.query;
        let query = { isPublished: true };

        if (category) query.category = category;

        const total = await News.countDocuments(query);
        const news = await News.find(query)
            .populate('author', 'name email profileImage')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            news,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single news
// @route   GET /api/news/:id
exports.getNewsById = async (req, res) => {
    try {
        const news = await News.findById(req.params.id)
            .populate('author', 'name email profileImage');

        if (!news) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }
        res.json({ success: true, news });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create news
// @route   POST /api/news
exports.createNews = async (req, res) => {
    try {
        req.body.author = req.user.id;
        const news = await News.create(req.body);
        res.status(201).json({ success: true, news });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update news
// @route   PUT /api/news/:id
exports.updateNews = async (req, res) => {
    try {
        let news = await News.findById(req.params.id);
        if (!news) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }

        if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        news = await News.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, news });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
exports.deleteNews = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }

        if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await News.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'News deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
exports.getEvents = async (req, res) => {
    try {
        const { type, upcoming, page = 1, limit = 12 } = req.query;
        let query = {};

        if (type) query.type = type;
        if (upcoming === 'true') query.date = { $gte: new Date() };

        const total = await Event.countDocuments(query);
        const events = await Event.find(query)
            .populate('organizer', 'name email profileImage')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ date: -1 });

        res.json({
            success: true,
            events,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email profileImage')
            .populate('attendees', 'name profileImage graduationYear department company');

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.json({ success: true, event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new event
// @route   POST /api/events
exports.createEvent = async (req, res) => {
    try {
        const {
            title, description, shortDescription, date, endDate, location,
            type, isOnline, meetingLink, maxAttendees, registrationType,
            price, registrationDeadline, organizerContact
        } = req.body;

        const event = await Event.create({
            title, description, shortDescription, date, endDate, location,
            type, isOnline, meetingLink, maxAttendees, registrationType,
            price, registrationDeadline, organizerContact,
            organizer: req.user.id
        });

        res.status(201).json({ success: true, event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Update event
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    RSVP to event
// @route   POST /api/events/:id/rsvp
exports.rsvpEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        const alreadyRSVP = event.attendees.includes(req.user.id);
        if (alreadyRSVP) {
            event.attendees = event.attendees.filter(id => id.toString() !== req.user.id);
        } else {
            event.attendees.push(req.user.id);
        }

        await event.save();
        res.json({ success: true, event, message: alreadyRSVP ? 'RSVP cancelled' : 'RSVP confirmed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const express = require('express');
const router = express.Router();
const { getActivities } = require('../controllers/activity.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, getActivities);

module.exports = router;

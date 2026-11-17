const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getMembershipStatus } = require('../controllers/membership.controller');
const { protect } = require('../middleware/auth');

router.get('/status', protect, getMembershipStatus);
router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;

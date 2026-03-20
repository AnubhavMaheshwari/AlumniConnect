const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    addUser,
    toggleBanUser,
    getBannedUsers,
    deleteUser,
    updateUserRole,
    searchUsers,
    getStats
} = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth');

// Apply protect and admin middleware to all routes
router.use(protect);
router.use(admin);

// User management routes
router.get('/users', getAllUsers);
router.post('/users', addUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/ban', toggleBanUser);
router.get('/banned-users', getBannedUsers);
router.get('/search', searchUsers);

// Statistics
router.get('/stats', getStats);

module.exports = router;

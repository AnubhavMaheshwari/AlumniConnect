const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;

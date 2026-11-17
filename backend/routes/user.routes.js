const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getUsers, getUser, updateUser, deleteUser, uploadProfilePhoto } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

// Setup multer for memory storage (we'll stream the buffer to Cloudinary in the controller)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

// Upload profile photo
router.put('/:id/profile-photo', protect, upload.single('image'), uploadProfilePhoto);

module.exports = router;

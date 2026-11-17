const express = require('express');
const { allMessages, sendMessage, reportMessage, editMessage, deleteMessage, sendAttachment, markAsRead } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/:chatId', protect, allMessages);
router.post('/report', protect, reportMessage);
router.post('/attachment', protect, upload.single('file'), sendAttachment);
router.post('/', protect, sendMessage);
router.put('/read/:chatId', protect, markAsRead);
router.put('/:id', protect, editMessage);
router.delete('/:id', protect, deleteMessage);

module.exports = router;

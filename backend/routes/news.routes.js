const express = require('express');
const router = express.Router();
const { getNews, getNewsById, createNews, updateNews, deleteNews } = require('../controllers/news.controller');
const { protect } = require('../middleware/auth');

router.get('/', getNews);
router.get('/:id', getNewsById);
router.post('/', protect, createNews);
router.put('/:id', protect, updateNews);
router.delete('/:id', protect, deleteNews);

module.exports = router;

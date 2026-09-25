const express = require('express');
const router = express.Router();
const { 
    optInMentor, 
    getMentors, 
    getMentor, 
    updateMentor, 
    deleteMentor 
} = require('../controllers/mentor.controller');
const { protect } = require('../middleware/auth');

router.get('/', getMentors);
router.get('/:id', getMentor);

router.post('/', protect, optInMentor);
router.put('/:id', protect, updateMentor);
router.delete('/:id', protect, deleteMentor);

module.exports = router;

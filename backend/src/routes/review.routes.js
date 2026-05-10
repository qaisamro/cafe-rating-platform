const express = require('express');
const router = express.Router();
const { createReview, getReviewsForModeration, moderateReview, getReviewsByCafe } = require('../controllers/review.controller');
const { auth, authorize } = require('../middleware/auth.middleware');

router.post('/', auth, createReview);
router.get('/moderation', auth, authorize('admin'), getReviewsForModeration);
router.get('/cafe/:cafeId', getReviewsByCafe);
router.put('/:id/moderate', auth, authorize('admin'), moderateReview);

module.exports = router;

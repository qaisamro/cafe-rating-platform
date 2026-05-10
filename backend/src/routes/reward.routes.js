const express = require('express');
const router = express.Router();
const { getRewards, createReward, redeemReward } = require('../controllers/reward.controller');
const { auth, authorize } = require('../middleware/auth.middleware');

router.get('/', auth, authorize('admin', 'owner'), getRewards);
router.post('/', auth, authorize('admin', 'owner'), createReward);
router.post('/:rewardId/redeem', auth, redeemReward);

module.exports = router;

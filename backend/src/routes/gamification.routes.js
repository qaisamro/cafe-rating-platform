const express = require('express');
const router = express.Router();
const { getSpinWheelRewards, getOwnerSpinWheelRewards, createSpinWheelReward, deleteSpinWheelReward, spinWheel, getSpinStatus, getMyWallet } = require('../controllers/gamification.controller');
const { auth, authorize } = require('../middleware/auth.middleware');

router.get('/rewards', auth, getSpinWheelRewards);
router.post('/spin', auth, spinWheel);
router.get('/spin-status', auth, getSpinStatus);
router.get('/my-wallet', auth, getMyWallet);

router.get('/owner/rewards', auth, authorize('owner', 'admin'), getOwnerSpinWheelRewards);
router.post('/owner/rewards', auth, authorize('owner', 'admin'), createSpinWheelReward);
router.delete('/owner/rewards/:id', auth, authorize('owner', 'admin'), deleteSpinWheelReward);

module.exports = router;

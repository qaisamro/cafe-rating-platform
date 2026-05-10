const express = require('express');
const router = express.Router();
const { getUsers, getMyProfile, updateMyProfile, updateUser, deductPoints, addPoints, updateUserLevel, syncAllLevels, deleteUser, getMyPoints, getPointsHistory } = require('../controllers/user.controller');
const { createOwner } = require('../controllers/admin.controller');
const { auth, authorize } = require('../middleware/auth.middleware');

router.get('/me', auth, getMyProfile);
router.put('/me', auth, updateMyProfile);
router.get('/my-points', auth, getMyPoints);
router.get('/points-history', auth, getPointsHistory);

router.get('/', auth, authorize('admin'), getUsers);
router.put('/sync-levels', auth, authorize('admin'), syncAllLevels);
router.put('/:id', auth, authorize('admin'), updateUser);
router.delete('/:id', auth, authorize('admin'), deleteUser);
router.post('/create-owner', auth, authorize('admin'), createOwner);
router.post('/:id/deduct-points', auth, authorize('admin'), deductPoints);
router.post('/:id/add-points', auth, authorize('admin'), addPoints);
router.put('/:id/level', auth, authorize('admin'), updateUserLevel);

module.exports = router;

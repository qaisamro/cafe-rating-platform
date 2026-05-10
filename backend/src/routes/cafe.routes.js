const express = require('express');
const router = express.Router();
const { getAllCafes, getCafeById, createCafe, updateCafe, getMyCafe } = require('../controllers/cafe.controller');

const { auth, authorize } = require('../middleware/auth.middleware');

router.get('/', getAllCafes);
router.get('/my-cafe', auth, authorize('owner', 'admin'), getMyCafe);
router.get('/:id', getCafeById);


router.post('/', auth, authorize('admin', 'owner'), createCafe);
router.put('/:id', auth, authorize('admin', 'owner'), updateCafe);

module.exports = router;

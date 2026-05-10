const express = require('express');
const router = express.Router();
const { getSettings, updateSetting, updateMultipleSettings } = require('../controllers/settings.controller');
const { auth, authorize } = require('../middleware/auth.middleware');

router.get('/', getSettings);
router.put('/single', auth, authorize('admin'), updateSetting);
router.put('/', auth, authorize('admin'), updateMultipleSettings);

module.exports = router;

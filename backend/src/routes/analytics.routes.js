const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/analytics.controller');
const { auth, authorize } = require('../middleware/auth.middleware');

router.get('/stats', auth, authorize('admin'), getAdminStats);

module.exports = router;

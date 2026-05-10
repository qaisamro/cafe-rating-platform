const express = require('express');
const router = express.Router();
const { generateQRCode, scanQRCode } = require('../controllers/qr.controller');
const { auth, authorize } = require('../middleware/auth.middleware');

router.post('/generate', auth, authorize('admin', 'owner'), generateQRCode);
router.post('/scan', auth, scanQRCode);

module.exports = router;

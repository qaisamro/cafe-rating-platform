const express = require('express');
const router = express.Router();
const { sendNotification, getMyNotifications, markAsRead, markAllAsRead, getUnreadCount, getAllNotifications, deleteNotification } = require('../controllers/notification.controller');
const { auth, authorize } = require('../middleware/auth.middleware');

router.get('/my', auth, getMyNotifications);
router.get('/unread-count', auth, getUnreadCount);
router.put('/read-all', auth, markAllAsRead);
router.put('/:id/read', auth, markAsRead);

router.get('/', auth, authorize('admin'), getAllNotifications);
router.post('/', auth, authorize('admin'), sendNotification);
router.delete('/:id', auth, authorize('admin'), deleteNotification);

module.exports = router;

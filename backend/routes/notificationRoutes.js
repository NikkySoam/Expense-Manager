const express = require('express');
const { getNotifications, deleteNotification, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getNotifications);
router.route('/:id').delete(protect, deleteNotification).put(protect, markAsRead);

module.exports = router;

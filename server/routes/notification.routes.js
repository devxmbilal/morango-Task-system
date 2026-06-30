const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.get('/notifications', authenticateToken, notificationController.getNotifications);
router.post('/notifications/read', authenticateToken, notificationController.markAllRead);
router.put('/notifications/:id/read', authenticateToken, notificationController.markOneRead);

module.exports = router;

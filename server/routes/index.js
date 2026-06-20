const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');
const memberRoutes = require('./member.routes');
const roleRoutes = require('./role.routes');
const settingRoutes = require('./setting.routes');
const notificationRoutes = require('./notification.routes');

// Mount routes
router.use(authRoutes);
router.use(taskRoutes);
router.use(memberRoutes);
router.use(roleRoutes);
router.use(settingRoutes);
router.use(notificationRoutes);

module.exports = router;

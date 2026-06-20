const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.get('/settings', settingController.getSettings);
router.put('/settings', authenticateToken, settingController.updateSettings);

module.exports = router;

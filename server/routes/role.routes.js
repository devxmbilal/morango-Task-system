const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.get('/roles', authenticateToken, roleController.getRoles);
router.post('/roles', authenticateToken, roleController.createRole);

module.exports = router;

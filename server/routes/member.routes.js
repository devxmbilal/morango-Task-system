const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.get('/members', authenticateToken, memberController.getMembers);
router.post('/members', authenticateToken, memberController.createMember);

module.exports = router;

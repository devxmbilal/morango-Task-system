const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.get('/members', authenticateToken, memberController.getMembers);
router.post('/members', authenticateToken, memberController.createMember);
router.put('/members/:id', authenticateToken, memberController.updateMember);
router.delete('/members/:id', authenticateToken, memberController.deleteMember);

module.exports = router;

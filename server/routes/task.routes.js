const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

router.get('/tasks', authenticateToken, taskController.getTasks);
router.post('/tasks', authenticateToken, taskController.createTask);
router.put('/tasks/:id', authenticateToken, taskController.updateTask);
router.post('/tasks/:id/comments', authenticateToken, taskController.addComment);
router.post('/upload', authenticateToken, upload.single('file'), taskController.uploadAttachment);

module.exports = router;

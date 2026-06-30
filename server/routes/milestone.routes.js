const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth.middleware');
const milestoneController = require('../controllers/milestone.controller');
const submissionController = require('../controllers/submission.controller');

router.get('/tasks/:taskId/milestones', authenticateToken, milestoneController.listMilestones);
router.post('/tasks/:taskId/milestones', authenticateToken, milestoneController.createMilestone);
router.put('/milestones/:id', authenticateToken, milestoneController.updateMilestone);
router.delete('/milestones/:id', authenticateToken, milestoneController.deleteMilestone);

router.get('/submissions/pending', authenticateToken, submissionController.listPendingForReview);
router.post('/milestones/:milestoneId/submissions', authenticateToken, submissionController.createSubmission);
router.put('/submissions/:id', authenticateToken, submissionController.updateSubmission);
router.put('/submissions/:id/review', authenticateToken, submissionController.reviewSubmission);

module.exports = router;

const prisma = require('../config/prisma');
const { formatSubmission, recomputeTaskProgress } = require('./milestone.controller');
const { sendSubmissionEmail, sendReviewEmail } = require('../utils/email');

const EDIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function canEditSubmission(submission, userId) {
  if (!submission) return false;
  if (submission.userId !== userId) return false;
  if (submission.status !== 'pending') return false;
  const ageMs = Date.now() - new Date(submission.createdAt).getTime();
  return ageMs <= EDIT_WINDOW_MS;
}

// POST /milestones/:milestoneId/submissions
// Body: { description, links: string[], attachments: [{ fileUrl, fileName }] }
async function createSubmission(req, res) {
  const milestoneId = parseInt(req.params.milestoneId, 10);
  const { description, links, attachments } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { task: { include: { assignee: true } } }
    });
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

    // Only the task's assignee may submit
    if (!milestone.task.assigneeId || milestone.task.assigneeId !== req.user.id) {
      return res.status(403).json({ error: 'Only the task assignee can submit work for this milestone' });
    }

    if (milestone.status === 'approved') {
      return res.status(400).json({ error: 'This milestone is already approved' });
    }

    const submission = await prisma.submission.create({
      data: {
        milestoneId,
        userId: req.user.id,
        description: description.trim(),
        links: JSON.stringify(Array.isArray(links) ? links.filter(Boolean) : []),
        status: 'pending',
        attachments: {
          create: (Array.isArray(attachments) ? attachments : [])
            .filter(a => a && a.fileUrl)
            .map(a => ({ fileUrl: a.fileUrl, fileName: a.fileName || '', kind: 'submission' }))
        }
      },
      include: {
        user: true,
        reviewedBy: true,
        attachments: true
      }
    });

    // Move milestone to submitted state
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'submitted' }
    });

    // Notify all admins (users with permAllTasks)
    const admins = await prisma.user.findMany({
      where: { isActive: true, role: { permAllTasks: true } }
    });

    for (const admin of admins) {
      if (admin.id === req.user.id) continue;
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'Work Submitted for Review',
          message: `${req.user.name} submitted work on milestone "${milestone.title}" (task ${milestone.taskId})`,
          taskId: milestone.taskId
        }
      });
    }

    // Fire emails (non-blocking)
    admins.forEach(admin => {
      if (admin.id === req.user.id || !admin.email) return;
      sendSubmissionEmail(
        admin.email,
        admin.name,
        req.user.name,
        milestone.taskId,
        milestone.task.title,
        milestone.title,
        description.trim()
      ).catch(err => console.error('sendSubmissionEmail error:', err));
    });

    res.json(formatSubmission(submission));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create submission' });
  }
}

// PUT /submissions/:id   (owner only, while pending and within 15 min)
// Body: { description, links: string[], attachments: [{ fileUrl, fileName }] }
async function updateSubmission(req, res) {
  const id = parseInt(req.params.id, 10);
  const { description, links, attachments } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { milestone: true, attachments: true }
    });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    if (submission.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own submission' });
    }
    if (submission.status !== 'pending') {
      return res.status(400).json({ error: 'This submission has already been reviewed and cannot be edited' });
    }
    const ageMs = Date.now() - new Date(submission.createdAt).getTime();
    if (ageMs > EDIT_WINDOW_MS) {
      return res.status(400).json({ error: 'Edit window (15 minutes) has expired for this submission' });
    }

    // Replace user-side attachments (keep review attachments untouched)
    await prisma.submissionAttachment.deleteMany({
      where: { submissionId: id, kind: 'submission' }
    });

    const newAttachments = (Array.isArray(attachments) ? attachments : [])
      .filter(a => a && a.fileUrl)
      .map(a => ({
        submissionId: id,
        fileUrl: a.fileUrl,
        fileName: a.fileName || '',
        kind: 'submission'
      }));
    if (newAttachments.length > 0) {
      await prisma.submissionAttachment.createMany({ data: newAttachments });
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        description: description.trim(),
        links: JSON.stringify(Array.isArray(links) ? links.filter(Boolean) : [])
      },
      include: { user: true, reviewedBy: true, attachments: true }
    });

    res.json(formatSubmission(updated));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update submission' });
  }
}

// PUT /submissions/:id/review   (admin only)
// Body: { action: 'approve' | 'reject', comment, reviewAttachments: [{ fileUrl, fileName }] }
async function reviewSubmission(req, res) {
  const id = parseInt(req.params.id, 10);
  const { action, comment, reviewAttachments } = req.body;

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action. Must be approve or reject.' });
  }

  try {
    const reviewer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    });
    if (!reviewer?.role?.permAllTasks) {
      return res.status(403).json({ error: 'Only admins can review submissions' });
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        milestone: { include: { task: true } },
        user: true
      }
    });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    if (submission.status !== 'pending') {
      return res.status(400).json({ error: 'Submission has already been reviewed' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Persist review-side attachments (admin's files)
    const reviewFiles = (Array.isArray(reviewAttachments) ? reviewAttachments : [])
      .filter(a => a && a.fileUrl)
      .map(a => ({
        submissionId: id,
        fileUrl: a.fileUrl,
        fileName: a.fileName || '',
        kind: 'review'
      }));
    if (reviewFiles.length > 0) {
      await prisma.submissionAttachment.createMany({ data: reviewFiles });
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        status: newStatus,
        reviewComment: comment || '',
        reviewedById: req.user.id,
        reviewedAt: new Date()
      },
      include: {
        user: true,
        reviewedBy: true,
        attachments: true
      }
    });

    // Sync milestone status to match latest review
    await prisma.milestone.update({
      where: { id: submission.milestoneId },
      data: { status: newStatus }
    });

    // Notify submitting user
    await prisma.notification.create({
      data: {
        userId: submission.userId,
        title: action === 'approve' ? 'Work Approved' : 'Work Rejected',
        message:
          action === 'approve'
            ? `${reviewer.name} approved your submission on milestone "${submission.milestone.title}"`
            : `${reviewer.name} rejected your submission on milestone "${submission.milestone.title}". ${comment ? 'Note: ' + comment : ''}`,
        taskId: submission.milestone.taskId
      }
    });

    // Recompute task progress based on milestone approvals
    await recomputeTaskProgress(submission.milestone.taskId);

    // Fire email (non-blocking)
    if (submission.user && submission.user.email) {
      sendReviewEmail(
        submission.user.email,
        submission.user.name,
        action,
        submission.milestone.taskId,
        submission.milestone.task.title,
        submission.milestone.title,
        comment || '',
        reviewer.name
      ).catch(err => console.error('sendReviewEmail error:', err));
    }

    res.json(formatSubmission(updated));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to review submission' });
  }
}

// POST /tasks/:id/submit  — direct task-level submission (assignee only, only when task has no sub-tasks)
// Creates a hidden "Task Delivery" sub-task and a submission on it.
async function submitTaskDirect(req, res) {
  const { id } = req.params;
  const { description, links, attachments } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { milestones: true }
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.assigneeId !== req.user.id) {
      return res.status(403).json({ error: 'Only the assignee can submit this task' });
    }
    if (task.milestones.length > 0) {
      return res.status(400).json({ error: 'This task has sub-tasks — submit on the relevant sub-task instead.' });
    }

    const milestone = await prisma.milestone.create({
      data: {
        taskId: id,
        title: 'Task Delivery',
        description: 'Submitted directly for this task.',
        order: 0,
        status: 'submitted'
      }
    });

    const submission = await prisma.submission.create({
      data: {
        milestoneId: milestone.id,
        userId: req.user.id,
        description: description.trim(),
        links: JSON.stringify(Array.isArray(links) ? links.filter(Boolean) : []),
        status: 'pending',
        attachments: {
          create: (Array.isArray(attachments) ? attachments : [])
            .filter(a => a && a.fileUrl)
            .map(a => ({ fileUrl: a.fileUrl, fileName: a.fileName || '', kind: 'submission' }))
        }
      },
      include: { user: true, reviewedBy: true, attachments: true }
    });

    const admins = await prisma.user.findMany({
      where: { isActive: true, role: { permAllTasks: true } }
    });
    for (const admin of admins) {
      if (admin.id === req.user.id) continue;
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'Work Submitted for Review',
          message: `${req.user.name} submitted work on task ${id}: "${task.title}"`,
          taskId: id
        }
      });
    }
    admins.forEach(admin => {
      if (admin.id === req.user.id || !admin.email) return;
      sendSubmissionEmail(
        admin.email, admin.name, req.user.name,
        id, task.title, 'Task Delivery', description.trim()
      ).catch(err => console.error('sendSubmissionEmail error:', err));
    });

    res.json(formatSubmission(submission));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to submit task' });
  }
}

// GET /submissions/pending  — admin only, all pending submissions across tasks
async function listPendingForReview(req, res) {
  try {
    const reviewer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    });
    if (!reviewer?.role?.permAllTasks) {
      return res.status(403).json({ error: 'Only admins can view pending submissions' });
    }

    const subs = await prisma.submission.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        milestone: { include: { task: true } }
      }
    });

    res.json(subs.map(s => ({
      id: s.id,
      milestoneId: s.milestoneId,
      milestoneTitle: s.milestone.title,
      taskId: s.milestone.taskId,
      taskTitle: s.milestone.task.title,
      userId: s.userId,
      userName: s.user ? s.user.name : '',
      description: s.description,
      createdAt: s.createdAt.toISOString()
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list pending submissions' });
  }
}

module.exports = {
  createSubmission,
  updateSubmission,
  reviewSubmission,
  listPendingForReview,
  submitTaskDirect,
  EDIT_WINDOW_MS,
  canEditSubmission
};

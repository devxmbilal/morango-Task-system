const prisma = require('../config/prisma');
const { formatRelativeTime } = require('../utils/time');

// Recompute task.progress from its milestones: approved / total * 100.
// When a task has no milestones, progress stays whatever the user set manually.
// Also auto-sets status to 'done' at 100% (and 'inprogress' when partially done).
async function recomputeTaskProgress(taskId) {
  const milestones = await prisma.milestone.findMany({ where: { taskId } });
  if (milestones.length === 0) return; // leave manual progress alone

  const approved = milestones.filter(m => m.status === 'approved').length;
  const progress = Math.round((approved / milestones.length) * 100);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return;

  const data = { progress };
  if (progress === 100) data.status = 'done';
  else if (progress > 0 && task.status === 'todo') data.status = 'inprogress';
  else if (progress === 0 && task.status === 'done') data.status = 'inprogress';

  await prisma.task.update({ where: { id: taskId }, data });
}

function formatSubmission(s) {
  const allAttachments = s.attachments || [];
  const map = a => ({ id: a.id, fileUrl: a.fileUrl, fileName: a.fileName || '' });
  return {
    id: s.id,
    milestoneId: s.milestoneId,
    userId: s.userId,
    userName: s.user ? s.user.name : '',
    description: s.description,
    links: s.links ? JSON.parse(s.links) : [],
    status: s.status,
    reviewComment: s.reviewComment || '',
    reviewedById: s.reviewedById || '',
    reviewedByName: s.reviewedBy ? s.reviewedBy.name : '',
    reviewedAt: s.reviewedAt ? s.reviewedAt.toISOString() : '',
    createdAt: s.createdAt.toISOString(),
    createdTime: formatRelativeTime(s.createdAt),
    attachments: allAttachments.filter(a => a.kind !== 'review').map(map),
    reviewAttachments: allAttachments.filter(a => a.kind === 'review').map(map)
  };
}

function formatMilestone(m) {
  return {
    id: m.id,
    taskId: m.taskId,
    title: m.title,
    description: m.description || '',
    dueDate: m.dueDate ? m.dueDate.toISOString() : '',
    order: m.order,
    status: m.status,
    createdAt: m.createdAt.toISOString(),
    submissions: (m.submissions || []).map(formatSubmission)
  };
}

// GET /tasks/:taskId/milestones
async function listMilestones(req, res) {
  const { taskId } = req.params;
  try {
    const milestones = await prisma.milestone.findMany({
      where: { taskId },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: {
        submissions: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: true,
            reviewedBy: true,
            attachments: true
          }
        }
      }
    });
    res.json(milestones.map(formatMilestone));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to retrieve milestones' });
  }
}

// POST /tasks/:taskId/milestones  (admin only)
async function createMilestone(req, res) {
  const { taskId } = req.params;
  const { title, description, dueDate, order } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Milestone title is required' });
  }

  try {
    const reviewer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    });
    if (!reviewer?.role?.permAllTasks) {
      return res.status(403).json({ error: 'Only admins can create milestones' });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    let nextOrder = order;
    if (nextOrder === undefined || nextOrder === null) {
      const last = await prisma.milestone.findFirst({
        where: { taskId },
        orderBy: { order: 'desc' }
      });
      nextOrder = last ? last.order + 1 : 0;
    }

    const created = await prisma.milestone.create({
      data: {
        taskId,
        title: title.trim(),
        description: description || '',
        dueDate: dueDate ? new Date(dueDate) : null,
        order: nextOrder
      },
      include: {
        submissions: {
          include: { user: true, reviewedBy: true, attachments: true }
        }
      }
    });

    // notify assignee about a new milestone
    if (task.assigneeId) {
      await prisma.notification.create({
        data: {
          userId: task.assigneeId,
          title: 'New Milestone',
          message: `Milestone "${created.title}" added to task ${taskId}`,
          taskId: taskId
        }
      });
    }

    await recomputeTaskProgress(taskId);
    res.json(formatMilestone(created));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create milestone' });
  }
}

// PUT /milestones/:id  (admin only)
async function updateMilestone(req, res) {
  const id = parseInt(req.params.id, 10);
  const { title, description, dueDate, order } = req.body;
  try {
    const reviewer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    });
    if (!reviewer?.role?.permAllTasks) {
      return res.status(403).json({ error: 'Only admins can update milestones' });
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (order !== undefined) data.order = order;

    const updated = await prisma.milestone.update({
      where: { id },
      data,
      include: {
        submissions: {
          orderBy: { createdAt: 'desc' },
          include: { user: true, reviewedBy: true, attachments: true }
        }
      }
    });
    res.json(formatMilestone(updated));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
}

// DELETE /milestones/:id  (admin only)
async function deleteMilestone(req, res) {
  const id = parseInt(req.params.id, 10);
  try {
    const reviewer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    });
    if (!reviewer?.role?.permAllTasks) {
      return res.status(403).json({ error: 'Only admins can delete milestones' });
    }
    const existing = await prisma.milestone.findUnique({ where: { id } });
    await prisma.milestone.delete({ where: { id } });
    if (existing) await recomputeTaskProgress(existing.taskId);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
}

module.exports = {
  listMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  formatMilestone,
  formatSubmission,
  recomputeTaskProgress
};

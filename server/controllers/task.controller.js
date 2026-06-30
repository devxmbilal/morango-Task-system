const prisma = require('../config/prisma');
const { formatRelativeTime } = require('../utils/time');
const { sendAssignmentEmail } = require('../utils/email');

// 1. SECURE: Get tasks (filtered by permissions)
async function getTasks(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    });

    const perms = user?.role || {};
    let tasks;

    if (perms.permAllTasks) {
      tasks = await prisma.task.findMany({
        include: {
          assignee: true,
          comments: { orderBy: { createdAt: 'desc' } },
          attachments: true
        },
        orderBy: { id: 'desc' }
      });
    } else {
      tasks = await prisma.task.findMany({
        where: { assigneeId: req.user.id },
        include: {
          assignee: true,
          comments: { orderBy: { createdAt: 'desc' } },
          attachments: true
        },
        orderBy: { id: 'desc' }
      });
    }

    const formattedTasks = tasks.map(t => ({
      id: t.id,
      title: t.title,
      desc: t.description || '',
      assigneeId: t.assigneeId || '',
      status: t.status,
      priority: t.priority,
      tag: t.tag,
      created: t.createdDate.toISOString(),
      start: t.startDate ? t.startDate.toISOString() : '',
      due: t.dueDate.toISOString(),
      acceptedAt: t.acceptedAt ? t.acceptedAt.toISOString() : '',
      referenceLinks: t.referenceLinks ? JSON.parse(t.referenceLinks) : [],
      progress: t.progress,
      images: t.attachments.map(att => att.fileUrl),
      comments: t.comments.map(c => ({
        id: c.id,
        author: c.authorName,
        text: c.text,
        time: formatRelativeTime(c.createdAt)
      }))
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
}

// 2. SECURE: Create task
async function createTask(req, res) {
  const { title, desc, assigneeId, priority, tag, due, images, referenceLinks, milestones } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const allTasks = await prisma.task.findMany({
      orderBy: { id: 'asc' }
    });
    let taskNum = 100001 + allTasks.length;
    let nextId = `TASK-${taskNum}`;

    while (allTasks.some(t => t.id === nextId)) {
      taskNum++;
      nextId = `TASK-${taskNum}`;
    }

    const newTask = await prisma.task.create({
      data: {
        id: nextId,
        title,
        description: desc || '',
        assigneeId: assigneeId || null,
        status: 'todo',
        priority: priority || 'medium',
        tag: tag || 'Web Portal',
        dueDate: new Date(due),
        createdDate: new Date(),
        startDate: assigneeId ? new Date() : null,
        referenceLinks: Array.isArray(referenceLinks) && referenceLinks.length
          ? JSON.stringify(referenceLinks.filter(Boolean))
          : null
      }
    });

    // Initial sub-tasks (milestones) provided at creation time
    if (Array.isArray(milestones)) {
      let order = 0;
      for (const m of milestones) {
        if (!m || !m.title || !m.title.trim()) continue;
        await prisma.milestone.create({
          data: {
            taskId: nextId,
            title: m.title.trim(),
            description: m.description || '',
            dueDate: m.dueDate ? new Date(m.dueDate) : null,
            order: order++,
            links: Array.isArray(m.links) && m.links.length
              ? JSON.stringify(m.links.filter(Boolean))
              : null,
            attachments: {
              create: (Array.isArray(m.attachments) ? m.attachments : [])
                .filter(a => a && a.fileUrl)
                .map(a => ({ fileUrl: a.fileUrl, fileName: a.fileName || '' }))
            }
          }
        });
      }
    }

    if (assigneeId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          title: 'New Task Assigned',
          message: `You have been assigned task ${nextId}: "${title}"`,
          taskId: nextId
        }
      });

      // Dispatch assignment email notification asynchronously
      prisma.user.findUnique({ where: { id: assigneeId } })
        .then(assignee => {
          if (assignee && assignee.email) {
            sendAssignmentEmail(assignee.email, assignee.name, nextId, title);
          }
        })
        .catch(err => console.error('Error sending assignment email:', err));
    }

    if (images && Array.isArray(images)) {
      for (const imgUrl of images) {
        await prisma.attachment.create({
          data: {
            taskId: newTask.id,
            fileUrl: imgUrl
          }
        });
      }
    }

    const created = await prisma.task.findUnique({
      where: { id: newTask.id },
      include: {
        assignee: true,
        comments: true,
        attachments: true
      }
    });

    res.json({
      id: created.id,
      title: created.title,
      desc: created.description,
      assigneeId: created.assigneeId || '',
      status: created.status,
      priority: created.priority,
      tag: created.tag,
      created: created.createdDate.toISOString(),
      start: created.startDate ? created.startDate.toISOString() : '',
      due: created.dueDate.toISOString(),
      acceptedAt: created.acceptedAt ? created.acceptedAt.toISOString() : '',
      referenceLinks: created.referenceLinks ? JSON.parse(created.referenceLinks) : [],
      progress: created.progress,
      images: created.attachments.map(att => att.fileUrl),
      comments: []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

// 3. SECURE: Update task
async function updateTask(req, res) {
  const { id } = req.params;
  const { status, progress, title, desc, assigneeId, priority, tag, due, referenceLinks, images } = req.body;

  try {
    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const data = {};
    if (status !== undefined) data.status = status;
    if (progress !== undefined) {
      // If task has milestones, progress is owned by the milestone-approval flow.
      // Reject manual progress edits so the bar stays in sync with approvals.
      const msCount = await prisma.milestone.count({ where: { taskId: id } });
      if (msCount > 0) {
        return res.status(400).json({
          error: 'This task has milestones — progress updates automatically as milestones are approved. Manual progress edit is disabled.'
        });
      }
      data.progress = parseInt(progress, 10);
      if (data.progress >= 100) {
        data.status = 'done';
      } else if (data.progress > 0 && task.status === 'todo') {
        data.status = 'inprogress';
      } else if (data.progress === 0 && task.status === 'inprogress') {
        data.status = 'todo';
      }
    }
    if (title !== undefined) data.title = title;
    if (desc !== undefined) data.description = desc;
    if (assigneeId !== undefined) {
      data.assigneeId = assigneeId || null;
      if ((assigneeId || null) !== task.assigneeId) {
        data.startDate = assigneeId ? new Date() : null;
        data.acceptedAt = null; // new assignee needs to accept again
      }
    }
    if (priority !== undefined) data.priority = priority;
    if (tag !== undefined) data.tag = tag;
    if (due !== undefined) data.dueDate = new Date(due);
    if (referenceLinks !== undefined) {
      data.referenceLinks = Array.isArray(referenceLinks) && referenceLinks.length
        ? JSON.stringify(referenceLinks.filter(Boolean))
        : null;
    }

    if (status === 'inprogress' && !task.startDate) {
      data.startDate = new Date();
    }

    const oldAssigneeId = task.assigneeId;
    const newAssigneeId = assigneeId !== undefined ? (assigneeId || null) : oldAssigneeId;

    if (newAssigneeId && newAssigneeId !== oldAssigneeId) {
      await prisma.notification.create({
        data: {
          userId: newAssigneeId,
          title: 'Task Assigned',
          message: `Task ${id} has been assigned to you: "${title || task.title}"`,
          taskId: id
        }
      });

      // Dispatch assignment email notification asynchronously
      prisma.user.findUnique({ where: { id: newAssigneeId } })
        .then(assignee => {
          if (assignee && assignee.email) {
            sendAssignmentEmail(assignee.email, assignee.name, id, title || task.title);
          }
        })
        .catch(err => console.error('Error sending assignment email:', err));
    }

    // If `images` array provided, replace task attachments wholesale.
    // (Array of URL strings — same shape getTasks returns.)
    if (Array.isArray(images)) {
      await prisma.attachment.deleteMany({ where: { taskId: id } });
      const fresh = images.filter(u => typeof u === 'string' && u);
      if (fresh.length > 0) {
        await prisma.attachment.createMany({
          data: fresh.map(fileUrl => ({ taskId: id, fileUrl }))
        });
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: true,
        comments: { orderBy: { createdAt: 'desc' } },
        attachments: true
      }
    });

    res.json({
      id: updated.id,
      title: updated.title,
      desc: updated.description,
      assigneeId: updated.assigneeId || '',
      status: updated.status,
      priority: updated.priority,
      tag: updated.tag,
      created: updated.createdDate.toISOString(),
      start: updated.startDate ? updated.startDate.toISOString() : '',
      due: updated.dueDate.toISOString(),
      acceptedAt: updated.acceptedAt ? updated.acceptedAt.toISOString() : '',
      referenceLinks: updated.referenceLinks ? JSON.parse(updated.referenceLinks) : [],
      progress: updated.progress,
      images: updated.attachments.map(att => att.fileUrl),
      comments: updated.comments.map(c => ({
        id: c.id,
        author: c.authorName,
        text: c.text,
        time: formatRelativeTime(c.createdAt)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
}

// 4. SECURE: Add comment
async function addComment(req, res) {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        taskId: id,
        authorName: req.user.name,
        text
      }
    });

    res.json({
      id: newComment.id,
      author: newComment.authorName,
      text: newComment.text,
      time: 'just now'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
}

// 5. SECURE: Upload attachment
function uploadAttachment(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // multer-storage-cloudinary populates req.file.path with the secure CDN URL.
  // Local disk storage gives us only a filename; build the static URL ourselves.
  const isRemote = typeof req.file.path === 'string' && /^https?:\/\//i.test(req.file.path);
  const fileUrl = isRemote
    ? req.file.path
    : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.json({
    fileUrl,
    fileName: req.file.originalname || ''
  });
}

// 6. SECURE: Delete task
async function deleteTask(req, res) {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}

// 7. SECURE: Assignee accepts the task
async function acceptTask(req, res) {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (task.assigneeId !== req.user.id) {
      return res.status(403).json({ error: 'Only the assignee can accept this task' });
    }
    if (task.acceptedAt) {
      return res.status(400).json({ error: 'Task already accepted' });
    }

    const data = {
      acceptedAt: new Date(),
      startDate: task.startDate || new Date()
    };
    if (task.status === 'todo') data.status = 'inprogress';

    const updated = await prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: true,
        comments: { orderBy: { createdAt: 'desc' } },
        attachments: true
      }
    });

    // Notify all admins that user has accepted the task
    const admins = await prisma.user.findMany({
      where: { isActive: true, role: { permAllTasks: true } }
    });
    for (const admin of admins) {
      if (admin.id === req.user.id) continue;
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'Task Accepted',
          message: `${req.user.name} has accepted task ${id}: "${task.title}" and started working on it.`,
          taskId: id
        }
      });
    }

    res.json({
      id: updated.id,
      title: updated.title,
      desc: updated.description,
      assigneeId: updated.assigneeId || '',
      status: updated.status,
      priority: updated.priority,
      tag: updated.tag,
      created: updated.createdDate.toISOString(),
      start: updated.startDate ? updated.startDate.toISOString() : '',
      due: updated.dueDate.toISOString(),
      acceptedAt: updated.acceptedAt ? updated.acceptedAt.toISOString() : '',
      referenceLinks: updated.referenceLinks ? JSON.parse(updated.referenceLinks) : [],
      progress: updated.progress,
      images: updated.attachments.map(att => att.fileUrl),
      comments: updated.comments.map(c => ({
        id: c.id, author: c.authorName, text: c.text,
        time: require('../utils/time').formatRelativeTime(c.createdAt)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to accept task' });
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  addComment,
  uploadAttachment,
  deleteTask,
  acceptTask
};

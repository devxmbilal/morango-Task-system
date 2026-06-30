const prisma = require('../config/prisma');

// 1. SECURE: Get user notifications
async function getNotifications(req, res) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: n.read,
      taskId: n.taskId || null,
      createdAt: n.createdAt
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

// PUT /notifications/:id/read  — mark single notification as read
async function markOneRead(req, res) {
  const id = parseInt(req.params.id, 10);
  try {
    await prisma.notification.updateMany({
      where: { id, userId: req.user.id },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

// 2. SECURE: Mark all notifications as read
async function markAllRead(req, res) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
}

module.exports = {
  getNotifications,
  markAllRead,
  markOneRead
};

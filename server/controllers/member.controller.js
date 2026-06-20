const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

// 1. SECURE: Get team members
async function getMembers(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: { role: true }
    });

    const tasks = await prisma.task.findMany();

    const members = users.map(user => {
      const userTasks = tasks.filter(t => t.assigneeId === user.id);
      const done = userTasks.filter(t => t.status === 'done').length;
      const active = userTasks.filter(t => t.status === 'inprogress').length;
      const pct = userTasks.length ? Math.round((done / userTasks.length) * 100) : 0;

      return {
        id: user.id,
        name: user.name,
        title: user.title || 'Member',
        email: user.email,
        color: user.color || '#64748b',
        roleId: user.roleId,
        roleName: user.role ? user.role.name : 'Member',
        isActive: user.isActive,
        total: userTasks.length,
        active,
        done,
        pct
      };
    });

    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve team members' });
  }
}

// 2. SECURE: Create team member
async function createMember(req, res) {
  const { name, email, title, roleId, password } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const palette = ['#0891b2', '#7c3aed', '#db2777', '#d97706', '#059669', '#2563eb', '#e11d48', '#0d9488', '#9333ea', '#ea580c'];
    const count = await prisma.user.count();
    const color = palette[count % palette.length];
    const passwordHash = await bcrypt.hash(password || 'demo1234', 10); // default fallback if empty

    const id = 'u' + Date.now().toString().slice(-6);

    const newUser = await prisma.user.create({
      data: {
        id,
        name,
        email,
        passwordHash,
        title: title || 'Team Member',
        roleId: roleId || 'employee',
        color,
        isActive: true
      },
      include: { role: true }
    });

    res.json({
      id: newUser.id,
      name: newUser.name,
      title: newUser.title,
      email: newUser.email,
      color: newUser.color,
      roleId: newUser.roleId,
      roleName: newUser.role ? newUser.role.name : 'Member',
      isActive: newUser.isActive,
      total: 0,
      active: 0,
      done: 0,
      pct: 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create team member' });
  }
}

// 3. SECURE: Update team member
async function updateMember(req, res) {
  const { id } = req.params;
  const { name, email, title, roleId, isActive, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists && exists.id !== id) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      data.email = email;
    }
    if (title !== undefined) data.title = title;
    if (roleId !== undefined) data.roleId = roleId;
    if (isActive !== undefined) data.isActive = !!isActive;
    if (password !== undefined && password.trim() !== '') {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      include: { role: true }
    });

    const tasks = await prisma.task.findMany({ where: { assigneeId: id } });
    const done = tasks.filter(t => t.status === 'done').length;
    const active = tasks.filter(t => t.status === 'inprogress').length;
    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

    res.json({
      id: updated.id,
      name: updated.name,
      title: updated.title || 'Member',
      email: updated.email,
      color: updated.color || '#64748b',
      roleId: updated.roleId,
      roleName: updated.role ? updated.role.name : 'Member',
      isActive: updated.isActive,
      total: tasks.length,
      active,
      done,
      pct
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
}

// 4. SECURE: Delete team member
async function deleteMember(req, res) {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
}

module.exports = {
  getMembers,
  createMember,
  updateMember,
  deleteMember
};

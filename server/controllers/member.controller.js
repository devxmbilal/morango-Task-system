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
        color
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

module.exports = {
  getMembers,
  createMember
};

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const JWT_SECRET = process.env.JWT_SECRET || 'morango_super_secret_key_12345';

// 1. PUBLIC: Get all accounts for quick login
async function getAccounts(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { name: 'asc' }
    });

    const accounts = users.map(user => ({
      id: user.id,
      name: user.name,
      title: user.title || 'Team Member',
      color: user.color || '#64748b',
      roleLabel: user.role ? user.role.name : 'Member',
      email: user.email
    }));

    res.json(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve accounts' });
  }
}

// 2. PUBLIC: Login
async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: 'Your account is inactive. Please contact your administrator.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roleId,
      title: user.title,
      color: user.color
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.roleId,
        title: user.title,
        color: user.color,
        perms: user.role ? user.role : {}
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
}

// 3. SECURE: Get user profile info
async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roleId,
      title: user.title,
      color: user.color,
      perms: user.role ? user.role : {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
}

// 4. SECURE: Update personal user profile
async function updateProfile(req, res) {
  const { name, email, password } = req.body;
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const data = {};
    if (name !== undefined && name.trim() !== '') data.name = name;
    if (email !== undefined && email.trim() !== '') {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists && exists.id !== userId) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      data.email = email;
    }
    if (password !== undefined && password.trim() !== '') {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      include: { role: true }
    });

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.roleId,
      title: updated.title,
      color: updated.color,
      perms: updated.role ? updated.role : {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

module.exports = {
  getAccounts,
  login,
  getProfile,
  updateProfile
};

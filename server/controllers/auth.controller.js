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

module.exports = {
  getAccounts,
  login,
  getProfile
};

const prisma = require('../config/prisma');

// 1. SECURE: Get roles
async function getRoles(req, res) {
  try {
    const roles = await prisma.role.findMany({
      include: { users: true }
    });

    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      color: role.color,
      system: role.system,
      memberCount: role.users.length,
      perms: {
        allTasks: role.permAllTasks,
        create: role.permCreate,
        team: role.permTeam,
        roles: role.permRoles,
        reports: role.permReports,
        settings: role.permSettings
      }
    }));

    res.json(formattedRoles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve roles' });
  }
}

// 2. SECURE: Create custom role
async function createRole(req, res) {
  const { name, color, perms } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Role name is required' });
  }

  try {
    const id = 'role_' + name.toLowerCase().replace(/\s+/g, '_');
    
    const exists = await prisma.role.findUnique({ where: { id } });
    if (exists) {
      return res.status(400).json({ error: 'A role with this name already exists' });
    }

    const newRole = await prisma.role.create({
      data: {
        id,
        name,
        color: color || '#7c3aed',
        system: false,
        permAllTasks: !!perms.allTasks,
        permCreate: !!perms.create,
        permTeam: !!perms.team,
        permRoles: !!perms.roles,
        permReports: !!perms.reports,
        permSettings: !!perms.settings
      }
    });

    res.json({
      id: newRole.id,
      name: newRole.name,
      color: newRole.color,
      system: false,
      memberCount: 0,
      perms: {
        allTasks: newRole.permAllTasks,
        create: newRole.permCreate,
        team: newRole.permTeam,
        roles: newRole.permRoles,
        reports: newRole.permReports,
        settings: newRole.permSettings
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create role' });
  }
}

module.exports = {
  getRoles,
  createRole
};

const prisma = require('../config/prisma');

// 1. SECURE: Get workspace settings
async function getSettings(req, res) {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,
          companyName: 'Morango AI',
          accent: '#4f46e5',
          sidebarTheme: 'light'
        }
      });
    }
    res.json({
      companyName: settings.companyName,
      accent: settings.accent,
      sidebarTheme: settings.sidebarTheme
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
}

// 2. SECURE: Update workspace settings
async function updateSettings(req, res) {
  const { companyName, accent, sidebarTheme } = req.body;
  try {
    const updated = await prisma.settings.update({
      where: { id: 1 },
      data: {
        companyName: companyName || undefined,
        accent: accent || undefined,
        sidebarTheme: sidebarTheme || undefined
      }
    });

    res.json({
      companyName: updated.companyName,
      accent: updated.accent,
      sidebarTheme: updated.sidebarTheme
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}

module.exports = {
  getSettings,
  updateSettings
};

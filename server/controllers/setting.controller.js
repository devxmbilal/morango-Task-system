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
          sidebarTheme: 'light',
          smtpHost: '',
          smtpPort: '',
          smtpUser: '',
          smtpPassword: '',
          smtpFrom: '',
          emailEnabled: false
        }
      });
    }
    res.json({
      companyName: settings.companyName,
      accent: settings.accent,
      sidebarTheme: settings.sidebarTheme,
      smtpHost: settings.smtpHost || '',
      smtpPort: settings.smtpPort || '',
      smtpUser: settings.smtpUser || '',
      smtpPassword: settings.smtpPassword || '',
      smtpFrom: settings.smtpFrom || '',
      emailEnabled: settings.emailEnabled
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
}

// 2. SECURE: Update workspace settings
async function updateSettings(req, res) {
  const { 
    companyName, 
    accent, 
    sidebarTheme, 
    smtpHost, 
    smtpPort, 
    smtpUser, 
    smtpPassword, 
    smtpFrom, 
    emailEnabled 
  } = req.body;

  try {
    const updated = await prisma.settings.update({
      where: { id: 1 },
      data: {
        companyName: companyName !== undefined ? companyName : undefined,
        accent: accent !== undefined ? accent : undefined,
        sidebarTheme: sidebarTheme !== undefined ? sidebarTheme : undefined,
        smtpHost: smtpHost !== undefined ? smtpHost : undefined,
        smtpPort: smtpPort !== undefined ? smtpPort : undefined,
        smtpUser: smtpUser !== undefined ? smtpUser : undefined,
        smtpPassword: smtpPassword !== undefined ? smtpPassword : undefined,
        smtpFrom: smtpFrom !== undefined ? smtpFrom : undefined,
        emailEnabled: emailEnabled !== undefined ? !!emailEnabled : undefined
      }
    });

    res.json({
      companyName: updated.companyName,
      accent: updated.accent,
      sidebarTheme: updated.sidebarTheme,
      smtpHost: updated.smtpHost || '',
      smtpPort: updated.smtpPort || '',
      smtpUser: updated.smtpUser || '',
      smtpPassword: updated.smtpPassword || '',
      smtpFrom: updated.smtpFrom || '',
      emailEnabled: updated.emailEnabled
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

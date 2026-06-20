const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');

async function sendAssignmentEmail(assigneeEmail, assigneeName, taskId, taskTitle) {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings || !settings.emailEnabled) {
      console.log(`Email notification skipped: Email alerts are disabled in settings.`);
      return;
    }

    const { smtpHost, smtpPort, smtpUser, smtpPassword, smtpFrom } = settings;
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      console.log(`Email notification skipped: SMTP configuration is incomplete.`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10) || 587,
      secure: parseInt(smtpPort, 10) === 465, // true for port 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    });

    const mailOptions = {
      from: smtpFrom || smtpUser,
      to: assigneeEmail,
      subject: `[Morango Task System] New Task Assigned: ${taskId}`,
      text: `Hello ${assigneeName},\n\nYou have been assigned a new task:\n\nTask ID: ${taskId}\nTitle: ${taskTitle}\n\nPlease log in to your dashboard to view the details and track progress.\n\nBest regards,\nMorango Task System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ececf1; border-radius: 14px; background: #fff;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">New Task Assigned</h2>
          <p>Hello <strong>${assigneeName}</strong>,</p>
          <p>You have been assigned a new task in the workspace:</p>
          <div style="padding: 16px; background: #f6f7f9; border-radius: 10px; margin: 20px 0;">
            <div style="font-size: 13px; font-weight: 700; color: #8a8a94; text-transform: uppercase;">Task ID</div>
            <div style="font-size: 15px; font-weight: 700; color: #16161a; margin-bottom: 12px; font-family: monospace;">${taskId}</div>
            <div style="font-size: 13px; font-weight: 700; color: #8a8a94; text-transform: uppercase;">Title</div>
            <div style="font-size: 16px; font-weight: 700; color: #16161a;">${taskTitle}</div>
          </div>
          <p>Please log in to your dashboard to review details, upload attachments, and update progress.</p>
          <hr style="border: 0; border-top: 1px solid #ececf1; margin: 24px 0;" />
          <p style="font-size: 12px; color: #8a8a94;">This is an automated notification from the Morango Task System.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email notification sent successfully to ${assigneeEmail}: Message ID = ${info.messageId}`);
  } catch (error) {
    console.error('Error dispatching task assignment email notification:', error);
  }
}

module.exports = {
  sendAssignmentEmail
};

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

async function getTransporter() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings || !settings.emailEnabled) return null;
  const { smtpHost, smtpPort, smtpUser, smtpPassword, smtpFrom } = settings;
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) return null;
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10) || 587,
    secure: parseInt(smtpPort, 10) === 465,
    auth: { user: smtpUser, pass: smtpPassword }
  });
  return { transporter, from: smtpFrom || smtpUser };
}

async function sendSubmissionEmail(adminEmail, adminName, submitterName, taskId, taskTitle, milestoneTitle, description) {
  try {
    const ctx = await getTransporter();
    if (!ctx) {
      console.log('Submission email skipped: SMTP not configured or email disabled.');
      return;
    }
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ececf1; border-radius: 14px; background: #fff;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">Work Submitted for Review</h2>
        <p>Hello <strong>${adminName}</strong>,</p>
        <p><strong>${submitterName}</strong> has submitted work that needs your review:</p>
        <div style="padding: 16px; background: #f6f7f9; border-radius: 10px; margin: 20px 0;">
          <div style="font-size: 13px; font-weight: 700; color: #8a8a94; text-transform: uppercase;">Task</div>
          <div style="font-size: 15px; font-weight: 700; color: #16161a; margin-bottom: 10px;">${taskId} — ${taskTitle}</div>
          <div style="font-size: 13px; font-weight: 700; color: #8a8a94; text-transform: uppercase;">Milestone</div>
          <div style="font-size: 15px; font-weight: 700; color: #16161a; margin-bottom: 10px;">${milestoneTitle}</div>
          <div style="font-size: 13px; font-weight: 700; color: #8a8a94; text-transform: uppercase;">Notes</div>
          <div style="font-size: 13.5px; color: #44444e; white-space: pre-wrap;">${description}</div>
        </div>
        <p>Please open your dashboard to approve or reject this submission.</p>
        <hr style="border: 0; border-top: 1px solid #ececf1; margin: 24px 0;" />
        <p style="font-size: 12px; color: #8a8a94;">Automated notification — Morango Task System.</p>
      </div>
    `;
    const info = await ctx.transporter.sendMail({
      from: ctx.from,
      to: adminEmail,
      subject: `[Morango] Review needed: ${taskId} — ${milestoneTitle}`,
      text: `${submitterName} submitted work on milestone "${milestoneTitle}" of task ${taskId} (${taskTitle}).\n\nNotes:\n${description}\n\nOpen your dashboard to approve or reject.`,
      html
    });
    console.log(`Submission email sent to ${adminEmail}: ${info.messageId}`);
  } catch (error) {
    console.error('Error dispatching submission email:', error);
  }
}

async function sendReviewEmail(userEmail, userName, action, taskId, taskTitle, milestoneTitle, comment, reviewerName) {
  try {
    const ctx = await getTransporter();
    if (!ctx) {
      console.log('Review email skipped: SMTP not configured or email disabled.');
      return;
    }
    const isApproved = action === 'approve';
    const accent = isApproved ? '#10b981' : '#ef4444';
    const headline = isApproved ? 'Submission Approved' : 'Submission Rejected';
    const next = isApproved
      ? 'Great work! No further action required for this milestone.'
      : 'Please review the feedback below and submit again.';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ececf1; border-radius: 14px; background: #fff;">
        <h2 style="color: ${accent}; margin-bottom: 20px;">${headline}</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p><strong>${reviewerName}</strong> has reviewed your submission:</p>
        <div style="padding: 16px; background: #f6f7f9; border-radius: 10px; margin: 20px 0;">
          <div style="font-size: 13px; font-weight: 700; color: #8a8a94; text-transform: uppercase;">Task</div>
          <div style="font-size: 15px; font-weight: 700; color: #16161a; margin-bottom: 10px;">${taskId} — ${taskTitle}</div>
          <div style="font-size: 13px; font-weight: 700; color: #8a8a94; text-transform: uppercase;">Milestone</div>
          <div style="font-size: 15px; font-weight: 700; color: #16161a; margin-bottom: 10px;">${milestoneTitle}</div>
          ${comment ? `<div style="font-size: 13px; font-weight: 700; color: #8a8a94; text-transform: uppercase;">Reviewer Comment</div><div style="font-size: 13.5px; color: #44444e; white-space: pre-wrap;">${comment}</div>` : ''}
        </div>
        <p>${next}</p>
        <hr style="border: 0; border-top: 1px solid #ececf1; margin: 24px 0;" />
        <p style="font-size: 12px; color: #8a8a94;">Automated notification — Morango Task System.</p>
      </div>
    `;
    const info = await ctx.transporter.sendMail({
      from: ctx.from,
      to: userEmail,
      subject: `[Morango] ${headline}: ${taskId} — ${milestoneTitle}`,
      text: `${reviewerName} ${isApproved ? 'approved' : 'rejected'} your submission on milestone "${milestoneTitle}" of task ${taskId}.${comment ? '\n\nComment: ' + comment : ''}\n\n${next}`,
      html
    });
    console.log(`Review email sent to ${userEmail}: ${info.messageId}`);
  } catch (error) {
    console.error('Error dispatching review email:', error);
  }
}

module.exports = {
  sendAssignmentEmail,
  sendSubmissionEmail,
  sendReviewEmail
};

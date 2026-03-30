const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter;

if (env.APP_EMAIL_ENABLED) {
  transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: env.MAIL_PORT === 465,
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASS,
    },
  });
}

const sendEmail = async ({ to, subject, html }) => {
  if (!env.APP_EMAIL_ENABLED || !transporter) {
    console.log(`Email disabled. Mock sending email to ${to} with subject: ${subject}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: env.MAIL_FROM || 'noreply@greensolutions.tech',
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to} with subject: ${subject}`);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};

module.exports = {
  sendEmail,
};
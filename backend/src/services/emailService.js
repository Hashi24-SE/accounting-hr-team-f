const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
  },
});

const sendOtp = async (toEmail, otp) => {
  if (!env.APP_EMAIL_ENABLED) {
    console.log(`[DEV MODE - APP_EMAIL_ENABLED=false] OTP for ${toEmail}: ${otp}`);
    return;
  }

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
      <h2 style="color: #1F3864;">Your Password Reset Code</h2>
      <div style="background-color: #1F3864; color: white; padding: 20px; font-size: 24px; font-weight: bold; display: inline-block; border-radius: 8px; margin: 20px 0;">
        ${otp}
      </div>
      <p>Expires in 10 minutes</p>
      <p style="color: red; font-size: 12px;">Do not share this code with anyone.</p>
    </div>
  `;

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: toEmail,
    subject: 'Your password reset code',
    html: htmlBody,
  });
};

module.exports = {
  sendOtp,
};
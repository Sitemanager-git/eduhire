const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_SMTP_USER, // your Brevo SMTP login
    pass: process.env.BREVO_SMTP_PASS,
  }
});

async function sendMail({ to, subject, html, text }) {
  return transporter.sendMail({
    from: `"Eduhire" <contact@readreeds.com>`,
    to,
    subject,
    html,
    text,
  });
}

module.exports = { sendMail };

const { sendMail } = require('../utils/emailService');

async function registerTeacher(req, res) {
  // ...registration logic
  await sendMail({
    to: req.body.email,
    subject: 'Welcome to Eduhire!',
    html: renderTemplate('welcome-teacher', { name: req.body.name }),
  });
}

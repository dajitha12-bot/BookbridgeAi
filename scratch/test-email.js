const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing Gmail SMTP dispatch to dajitha12@gmail.com...');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'dajitha12@gmail.com',
      pass: 'nwiwnyzhkgsffvuo',
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"BookBridge AI" <dajitha12@gmail.com>',
      to: 'dajitha12@gmail.com',
      subject: 'BookBridge AI Test Email - Direct Gmail Dispatch',
      html: '<h1>BookBridge AI Test Email</h1><p>This is a test payment email sent directly via Gmail SMTP.</p>',
    });

    console.log('SUCCESS! Email dispatched. Message ID:', info.messageId);
  } catch (err) {
    console.error('ERROR sending email via Nodemailer:', err);
  }
}

testEmail();

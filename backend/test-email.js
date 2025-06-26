require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    let info = await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'SMTP Test',
      text: 'This is a test email from nodemailer.',
    });
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('SMTP Error:', error);
  }
}

test();

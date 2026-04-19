/**
 * Nodemailer transport wrapper.
 * Call mailer.send(options) to dispatch an email.
 */
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email.
 * @param {object} opts
 * @param {string[]} opts.to        - Array of recipient email addresses
 * @param {string}   opts.subject   - Email subject
 * @param {string}   opts.text      - Plain-text body
 * @param {string}   [opts.html]    - Optional HTML body
 */
async function send({ to, subject, text, html }) {
  const info = await transport.sendMail({
    from:    `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to:      to.join(', '),
    subject,
    text,
    html: html || text,
  });
  return info;
}

module.exports = { send };

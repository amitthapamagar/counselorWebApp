/**
 * Email route.
 *
 *  POST /api/email/send   — send a message to one or more counselors
 *
 *  Body: { to: string[], subject: string, text: string, html?: string }
 */
const express = require('express');
const router  = express.Router();
const mailer  = require('../utils/mailer');

router.post('/send', async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!Array.isArray(to) || to.length === 0) {
    return res.status(400).json({ error: '"to" must be a non-empty array of email addresses' });
  }
  if (!subject || !subject.trim()) {
    return res.status(400).json({ error: '"subject" is required' });
  }
  if (!text || !text.trim()) {
    return res.status(400).json({ error: '"text" (message body) is required' });
  }

  const invalid = to.filter(addr => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr));
  if (invalid.length) {
    return res.status(400).json({ error: `Invalid email address(es): ${invalid.join(', ')}` });
  }

  try {
    const info = await mailer.send({ to, subject, text, html });
    res.json({ message: 'Email sent successfully', messageId: info.messageId });
  } catch (err) {
    console.error('[mailer]', err.message);
    res.status(500).json({ error: 'Failed to send email. Check SMTP credentials.' });
  }
});

module.exports = router;

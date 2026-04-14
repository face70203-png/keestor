const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');
const rateLimit = require('express-rate-limit');

// 🛡️ Limit contact form submissions to 3 per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3,
  message: { error: 'Too many messages sent. Please try again in an hour.' }
});

router.post('/', contactLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // 📨 Send internal notification to Admin
    await sendEmail({
      email: process.env.SMTP_USER, // Send to the store owner
      subject: `[KeeStore Contact] ${subject}`,
      message: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3b82f6;">New Contact Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
        </div>
      `
    });

    res.status(200).json({ success: true, message: 'Message sent successfully! Our team will reply shortly.' });
  } catch (err) {
    console.error('[CONTACT] Failed:', err.message);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router;

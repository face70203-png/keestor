const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Auto-generate ref code for legacy users
    if (!user.referralCode) {
        user.referralCode = user.username.toUpperCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000);
        await user.save();
    }

    res.json(user);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Get current user referral status
router.get('/referrals', auth, async (req, res) => {
  try {
    const count = await User.countDocuments({ referredBy: req.user._id });
    res.json({ totalReferrals: count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get all users (Admin Only)
router.get('/', adminAuth, async (req, res) => {
  try {

    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User Wallet Balance (Admin Only)
router.put('/:id/wallet', adminAuth, async (req, res) => {
  try {

    const { balance } = req.body;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    targetUser.walletBalance = Number(balance) || 0;
    await targetUser.save();
    
    res.json({ message: 'Balance updated', user: targetUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User Role (Admin Only)
router.put('/:id/role', adminAuth, async (req, res) => {
    try {
  
      const { role } = req.body;
      const targetUser = await User.findById(req.params.id);
      if (!targetUser) return res.status(404).json({ error: 'User not found' });
  
      targetUser.role = role === 'admin' ? 'admin' : 'user';
      await targetUser.save();
      
      res.json({ message: 'Role updated', user: targetUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Delete User (Admin Only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Block User (Admin Only)
router.put('/:id/block', adminAuth, async (req, res) => {
    try {

        const targetUser = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'User blocked successfully', user: targetUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unblock User (Admin Only)
router.put('/:id/unblock', adminAuth, async (req, res) => {
    try {

        const targetUser = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'User unblocked successfully', user: targetUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send Message/Email to User (Admin Only)
router.post('/:id/message', adminAuth, async (req, res) => {
    try {

        const { subject, message } = req.body;
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        const sendEmail = require('../utils/sendEmail');
        await sendEmail({
            email: targetUser.email,
            subject: subject || 'Message from KeeStore Admin',
            message: `<h1>Hello ${targetUser.username},</h1><p>${message}</p>`
        });

        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

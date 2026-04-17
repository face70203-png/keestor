const express = require('express');
const router = express.Router();
const SystemLog = require('../models/SystemLog');
const { adminAuth } = require('../middleware/auth');

// @route   GET /api/diagnostics/logs
// @desc    Get system diagnostic logs
// @access  Private/Admin
router.get('/logs', adminAuth, async (req, res) => {
  try {
    const logs = await SystemLog.find()
      .populate('metadata.orderId', '_id status totalAmount')
      .populate('metadata.userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(100);
      
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/diagnostics/logs
// @desc    Clear all logs
// @access  Private/Admin
router.delete('/logs/clear', adminAuth, async (req, res) => {
  try {
    await SystemLog.deleteMany({});
    res.json({ message: 'All logs cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

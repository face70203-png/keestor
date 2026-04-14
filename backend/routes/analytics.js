const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { auth } = require('../middleware/auth');

// Get high-level stats for Admin Dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const [totalOrders, totalUsers, totalProducts, logs] = await Promise.all([
      Order.countDocuments({ status: 'success' }),
      User.countDocuments(),
      Product.countDocuments(),
      AuditLog.find().sort({ createdAt: -1 }).limit(10)
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const revenue = revenueResult[0]?.total || 0;

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      revenue,
      recentLogs: logs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

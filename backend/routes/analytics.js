const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { auth, adminAuth } = require('../middleware/auth');

// Get high-level stats for Admin Dashboard
router.get('/stats', adminAuth, async (req, res) => {
  try {

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

    // ⏱️ NEW: Daily Revenue (Last 30 days) for charts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await Order.aggregate([
      { $match: { status: 'success', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" }
      }},
      { $sort: { "_id": 1 } }
    ]);

    // 📊 NEW: Category Breakdown for charts
    const categoryStats = await Order.aggregate([
        { $match: { status: 'success' } },
        { $unwind: "$items" },
        { $group: {
            _id: "$items.category" || "General",
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }},
        { $sort: { revenue: -1 } }
    ]);

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      revenue,
      dailyStats,
      categoryStats,
      recentLogs: logs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

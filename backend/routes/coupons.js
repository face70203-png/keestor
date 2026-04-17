const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { auth, adminAuth } = require('../middleware/auth');

// Validate code (Public / Authenticated)
router.post('/validate', async (req, res) => {
   try {
       const { code } = req.body;
       const coupon = await Coupon.findOne({ code: code.toUpperCase() });

       if (!coupon || !coupon.isActive) return res.status(404).json({ error: 'Invalid or expired coupon' });
       if (coupon.maxUses > 0 && coupon.currentUses >= coupon.maxUses) return res.status(400).json({ error: 'Coupon usage limit reached' });

       res.json({ discountPercent: coupon.discountPercent });
   } catch (err) {
       res.status(500).json({ error: err.message });
   }
});

// Admin ONLY routes below
router.get('/', adminAuth, async (req, res) => {
   try {

       const coupons = await Coupon.find().sort({ createdAt: -1 });
       res.json(coupons);
   } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/', adminAuth, async (req, res) => {
    try {
 
        const { code, discountPercent, maxUses } = req.body;
        const coupon = new Coupon({ code, discountPercent, maxUses });
        await coupon.save();
        res.json(coupon);
    } catch(e) { res.status(400).json({ error: e.message }); }
 });

router.delete('/:id', adminAuth, async (req, res) => {
    try {
 
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

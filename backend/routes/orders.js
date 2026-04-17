const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { auth, adminAuth } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Create checkout session (Cart support for Stripe)
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { items } = req.body; // Expects layout: [ { productId, quantity } ]
    if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    let totalAmount = 0;
    const line_items = [];
    const productsToUpdate = [];

    for (let item of items) {
      if (!item.quantity || item.quantity <= 0) return res.status(400).json({ error: 'Invalid quantity' });
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ error: `Product not found: ${item.productId}` });
      if (product.keys.length < item.quantity) return res.status(400).json({ error: `Not enough stock for ${product.title}` });
      
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: product.title, description: product.description },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      });

      productsToUpdate.push({ product, quantity: item.quantity });
    }

    const orderItems = productsToUpdate.map(p => ({
        productId: p.product._id,
        title: p.product.title,
        price: p.product.price,
        quantity: p.quantity,
        imageUrl: p.product.imageUrl,
        activationSteps: p.product.activationSteps
    }));

    const totalCalculated = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = new Order({
       user: req.user._id,
       status: 'pending',
       items: orderItems,
       totalAmount: totalCalculated,
       deliveredKey: 'Awaiting checkout...',
       product: orderItems[0].productId // Legacy support
    });
    await order.save();

    const frontendUrl = process.env.FRONTEND_URL ? (process.env.FRONTEND_URL.startsWith('http') ? process.env.FRONTEND_URL : `https://${process.env.FRONTEND_URL}`) : 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${frontendUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${frontendUrl}/cart?canceled=true`,
      metadata: { orderId: order._id.toString() },
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pay with Wallet Route
router.post('/pay-wallet', auth, async (req, res) => {
  try {
    const { items, promoCode } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const User = require('../models/User');
    const Coupon = require('../models/Coupon');
    const user = await User.findById(req.user._id);

    let totalAmount = 0;
    let deliveredKeysArr = [];
    let productsToUpdate = [];

    for (let item of items) {
       const qty = Math.abs(Number(item.quantity) || 0);
       if (qty <= 0) return res.status(400).json({ error: 'Invalid quantity' });

       const product = await Product.findById(item.productId);
       if (!product) return res.status(404).json({ error: `Product not found: ${item.productId}` });
       if (product.keys.length < qty) return res.status(400).json({ error: `Not enough stock for ${product.title}` });
       
       const price = Math.abs(product.price);
       totalAmount += (price * qty);
       productsToUpdate.push({ product, quantity: qty });
    }

    let couponToUpdate = null;
    if (promoCode) {
        const coupon = await Coupon.findOne({ code: promoCode.toUpperCase(), isActive: true });
        if (coupon && (coupon.maxUses === 0 || coupon.currentUses < coupon.maxUses)) {
             totalAmount = totalAmount * (1 - (coupon.discountPercent / 100));
             couponToUpdate = coupon; // Defer saving until AFTER wallet verification
        }
    } else {
        // Automatic 10% Referral Discount on First Order
        if (user.referredBy) {
             const Order = require('../models/Order');
             const existingOrdersCount = await Order.countDocuments({ user: user._id, status: 'success' });
             if (existingOrdersCount === 0) {
                  totalAmount = totalAmount * 0.90; // 10% off
             }
        }
    }

    if (user.walletBalance < totalAmount) {
       return res.status(400).json({ error: 'Insufficient Wallet Balance' });
    }

    // Process coupon strictly now that balance is guaranteed
    if (couponToUpdate) {
        couponToUpdate.currentUses += 1;
        await couponToUpdate.save();
    }

    // Deduct and fulfill
    user.walletBalance -= totalAmount;
    await user.save();

    const orderItemsFinal = [];
    for (let item of productsToUpdate) {
       const itemKeys = [];
       for(let i=0; i<item.quantity; i++) {
           let key = item.product.keys.shift();
           // Robust check: wrap string keys into objects for fulfillment
           const keyObj = (typeof key === 'string') ? { value: key, keyType: 'text' } : key;
           itemKeys.push(keyObj);
           deliveredKeysArr.push(keyObj);
       }
       await item.product.save();
       orderItemsFinal.push({
           productId: item.product._id,
           title: item.product.title,
           price: item.product.price,
           quantity: item.quantity,
           imageUrl: item.product.imageUrl,
           activationSteps: item.product.activationSteps,
           keys: itemKeys
       });
    }

    // Record order
    const order = new Order({
       user: req.user._id,
       status: 'success',
       items: orderItemsFinal,
       totalAmount: totalAmount,
       deliveredKey: deliveredKeysArr.map(k => k.value).join(', '),
       product: orderItemsFinal[0].productId 
    });
    order.markModified('items');
    await order.save();

    // 📧 SEND SUCCESS EMAIL
    try {
        const sendEmail = require('../utils/sendEmail');
        await sendEmail({
            email: user.email,
            subject: `Order Success - KeeStore #${order._id.toString().slice(-6)}`,
            message: 'PLACEHOLDER', // Will be replaced by invoice template
            order: order
        });
    } catch (emailErr) {
        console.error("Wallet Fulfillment Email Error:", emailErr.message);
    }

    // 🤝 REFERRAL REWARD LOGIC (Grant $5 to inviter on first purchase)
    if (user.referredBy) {
        const existingOrdersCount = await Order.countDocuments({ user: user._id, status: 'success' });
        if (existingOrdersCount === 1) { // 1 because we JUST saved the current order above
            const inviter = await User.findById(user.referredBy);
            if (inviter) {
                inviter.walletBalance += 5;
                await inviter.save();
            }
        }
    }

    res.json({ success: true, order, balance: user.walletBalance });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fulfillment Helper
const fulfillOrder = async (orderId, sessionId) => {
    // Atomic status update: Lock the order exclusively for processing if it is 'pending'
    const order = await Order.findOneAndUpdate(
       { _id: orderId, status: 'pending' },
       { $set: { status: 'processing' } },
       { new: true }
    );
    
    if (order) {
       const deliveredKeysArr = [];
       for (let item of order.items) {
           const prod = await Product.findById(item.productId);
           if (!prod) continue;
           
           // Dispense n keys from the product's keys array
           const dispensed = prod.keys.splice(0, item.quantity).map(k => 
               (typeof k === 'string') ? { value: k, keyType: 'text' } : k
           );
           item.keys = dispensed; // Always store as { value, keyType } objects
           deliveredKeysArr.push(...dispensed.map(k => k.value)); // For the summary string
           await prod.save();
       }
       
       order.status = 'success';
       order.deliveredKey = deliveredKeysArr.join(', ');
       if (sessionId) order.stripeSessionId = sessionId;

       // 💳 Fetch Card Info from Stripe if applicable
       if (sessionId) {
           try {
               const session = await stripe.checkout.sessions.retrieve(sessionId, {
                   expand: ['payment_intent.payment_method']
               });
               const paymentMethod = session.payment_intent?.payment_method;
               if (paymentMethod && paymentMethod.card) {
                   order.cardLast4 = paymentMethod.card.last4;
                   order.cardBrand = paymentMethod.card.brand;
               }
           } catch (stripeErr) {
               console.error("Stripe Card Retrieval Error:", stripeErr.message);
           }
       }

       order.markModified('items');
       await order.save();

       // 📧 Send Professional Success Email
       const User = require('../models/User');
       const user = await User.findById(order.user);
       if (user) {
           const sendEmail = require('../utils/sendEmail');
           sendEmail({
               email: user.email,
               subject: `Order Success - KeeStore #${order._id.toString().slice(-6)}`,
               message: 'PLACEHOLDER_INVOICE_TEMPLATE', // Will be replaced by actual template logic in sendEmail
               order: order // Pass order object for rich templating
           }).catch(e => console.error("Fulfillment Email Error:", e.message));
       }

       // 🤝 REFERRAL REWARD LOGIC
       if (user && user.referredBy) {
           const existingOrdersCount = await Order.countDocuments({ user: user._id, status: 'success' });
           if (existingOrdersCount === 1) {
               const inviter = await User.findById(user.referredBy);
               if (inviter) {
                   inviter.walletBalance += 5;
                   await inviter.save();
               }
           }
       }
       return order;
    }
    return null;
};

// Local dev verify-session bypass
router.post('/verify-session', auth, async (req, res) => {
  try {
     const { session_id, order_id } = req.body;
     const session = await stripe.checkout.sessions.retrieve(session_id);
     if (session.payment_status === 'paid') {
        const order = await fulfillOrder(order_id, session_id);
        if (order) return res.json({ success: true, order });
        return res.json({ success: true, message: 'Already processed or Order not found' });
     }
     res.status(400).json({ error: 'Payment not completed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Stripe Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = req.body;
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await fulfillOrder(session.metadata.orderId, session.id);
    }
    res.json({ received: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get user orders (Dashboard)
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, status: 'success' })
      .populate('product', 'title imageUrl description price')
      .sort({ createdAt: -1 });

    // 🔄 Backward Compatibility: Ensure all keys are objects { value, keyType }
    const formattedOrders = orders.map(order => {
        const orderObj = order.toObject();
        orderObj.items = orderObj.items.map(item => ({
            ...item,
            keys: (item.keys || []).map(k => (typeof k === 'string') ? { value: k, keyType: 'text' } : k)
        }));
        return orderObj;
    });

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Route: Get Analytics Stats
router.get('/stats', adminAuth, async (req, res) => {
  try {

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Daily Revenue (Last 30 days)
    const dailyStats = await Order.aggregate([
      { $match: { status: 'success', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]);

    // 2. Category Breakdown
    // Since an order can have multiple products from different categories, we aggregate items
    const categoryStats = await Order.aggregate([
        { $match: { status: 'success' } },
        { $unwind: "$items" },
        { $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'productDetails'
        }},
        { $unwind: "$productDetails" },
        { $group: {
            _id: "$productDetails.category",
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            count: { $sum: "$items.quantity" }
        }},
        { $sort: { revenue: -1 } }
    ]);

    res.json({ dailyStats, categoryStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Route: Get ALL Orders globally
router.get('/all', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'username email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Route: Wipe single order
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order wiped successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Route: Wipe entirely all history
router.delete('/wipe/all', adminAuth, async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ message: 'All transaction history wiped successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { auth, adminAuth } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const SystemLog = require('../models/SystemLog');

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
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
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

       // 📝 Audit Log
       await SystemLog.create({
           type: 'ORDER_SUCCESS',
           level: 'info',
           module: 'Fulfillment',
           message: `Order #${order._id.toString().slice(-6)} fulfilled for $${order.totalAmount}`,
           metadata: { 
               orderId: order._id, 
               userId: order.user 
           }
       }).catch(e => console.error("Log Error:", e.message));

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

// Track single order details via API (Public) - Must be after specific routes
router.get('/:id', async (req, res) => {
  try {
    let order;
    
    // Support tracking by full MongoDB ObjectId or short 12-char UID
    if (req.params.id.length === 24) {
        order = await Order.findById(req.params.id).populate('product', 'title imageUrl description');
    } else {
        // Fallback or short ID logic
        const shortId = req.params.id.replace('#', '').toLowerCase();
        const allOrders = await Order.find().populate('product', 'title imageUrl description');
        order = allOrders.find(o => o._id.toString().slice(-12).toLowerCase() === shortId);
    }
    
    if (!order) {
       return res.status(404).json({ error: 'Tracking ID not found in the global registry.' });
    }

    // Mask sensitive ledger data for unauthenticated public requests
    const isPinValid = req.query.pin && order.securityPin && req.query.pin === order.securityPin;

    const safeOrder = {
       _id: order._id,
       date: order.createdAt,
       status: order.status,
       totalAmount: order.totalAmount,
       items: order.items.map(i => ({
           title: i.title,
           quantity: i.quantity,
           imageUrl: i.imageUrl,
           // SECURITY FIX: Only expose the digital keys if PIN validation succeeded
           ...(isPinValid && { keys: i.keys, activationSteps: i.activationSteps })
       }))
    };
    
    // Only reveal digital asset keys if PIN matches
    if (isPinValid) {
        safeOrder.deliveredKey = order.deliveredKey; // Legacy support
        safeOrder.isAuthorized = true;
    } else {
        safeOrder.isAuthorized = false;
    }
    
    res.json(safeOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/orders/forgot-pin
// @desc    Dispatch the security PIN to the email associated with the specified order
// @access  Public (Rate Limited implicitly by express-rate-limit)
router.post('/forgot-pin', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'Order ID is required' });

    let order;
    if (orderId.length === 24) {
        order = await Order.findById(orderId).populate('user', 'email username');
    } else {
        const shortId = orderId.replace('#', '').toLowerCase();
        const allOrders = await Order.find().populate('user', 'email username');
        order = allOrders.find(o => o._id.toString().slice(-12).toLowerCase() === shortId);
    }

    if (!order || !order.user || !order.user.email) {
       // Return a generic positive message to prevent order enumeration / email leakage
       return res.json({ message: 'If this order exists, the PIN has been dispatched.' });
    }

    const sendEmail = require('../utils/sendEmail');
    await sendEmail({
      email: order.user.email,
      subject: `KeeStore Security PIN Recovery - ${order._id.toString().slice(-12).toUpperCase()}`,
      message: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0f172a; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">KeeStore</h1>
            </div>
            <div style="padding: 30px; background-color: #fafafa;">
                <p>Hello <strong>${order.user.username}</strong>,</p>
                <p>You requested to recover the tracking PIN for Order <strong>#${order._id.toString().slice(-12).toUpperCase()}</strong>.</p>
                <div style="background: white; border: 1px solid #e2e8f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 2px;">Your Security PIN</p>
                    <h2 style="margin: 10px 0 0 0; font-size: 32px; color: #10b981; letter-spacing: 4px;">${order.securityPin}</h2>
                </div>
            </div>
        </div>
      `
    });

    res.json({ message: 'If this order exists, the PIN has been dispatched.' });
  } catch (error) {
    console.error("Forgot PIN Error:", error);
    // Generic error to prevent data leakage
    res.status(500).json({ error: 'Failed to process request.' });
  }
});

// @route   GET /api/orders/:id/invoice
// @desc    Download PDF invoice for an order instantly
// @access  Public (Obfuscated ID + PIN Protected)
router.get('/:id/invoice', async (req, res) => {
    try {
        let order;
        if (req.params.id.length === 24) {
            order = await Order.findById(req.params.id).populate('product', 'title imageUrl description');
        } else {
            const shortId = req.params.id.replace('#', '').toLowerCase();
            const allOrders = await Order.find().populate('product');
            order = allOrders.find(o => o._id.toString().slice(-12).toLowerCase() === shortId);
        }

        if (!order) return res.status(404).send('Invoice Not Found');

        // Security check
        if (!req.query.pin || req.query.pin !== order.securityPin) {
            return res.status(403).send('Unauthorized. Valid tracking PIN is required to download this official document.');
        }

        const generateInvoicePDF = require('../utils/generateInvoicePDF');
        const base64Pdf = await generateInvoicePDF(order);
        const pdfBuffer = Buffer.from(base64Pdf, 'base64');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="KeeStore_Invoice_${order._id.toString().slice(-12).toUpperCase()}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).send('Error generating invoice: ' + error.message);
    }
});

module.exports = router;

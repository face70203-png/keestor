const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get wallet balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Top-up Checkout Session
router.post('/create-topup-session', auth, async (req, res) => {
  try {
    let { amount } = req.body;
    amount = Math.abs(Number(amount) || 0);
    if (amount < 1) return res.status(400).json({ error: 'Minimum top-up is $1.00' });

    const frontendUrl = process.env.FRONTEND_URL ? (process.env.FRONTEND_URL.startsWith('http') ? process.env.FRONTEND_URL : `https://${process.env.FRONTEND_URL}`) : 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'KeeStore Wallet Funds', description: `Add $${amount} to your digital wallet.` },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${frontendUrl}/dashboard?topup_session_id={CHECKOUT_SESSION_ID}&amount=${amount}`,
      cancel_url: `${frontendUrl}/dashboard?canceled=true`,
      metadata: { userId: req.user._id.toString(), type: 'wallet_topup', amount: amount.toString() },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Local Top-up
router.post('/verify-topup', auth, async (req, res) => {
  try {
    const { session_id, amount } = req.body;
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid' && session.metadata.type === 'wallet_topup') {
        const processedAmount = parseFloat(amount);
        
        // Atomic transaction: Find user ONLY IF they haven't used this session ID yet.
        // Then atomically push the session ID and increment balance.
        const user = await User.findOneAndUpdate(
            { _id: req.user._id, usedCheckoutSessions: { $ne: session_id } },
            { 
                $inc: { walletBalance: processedAmount },
                $addToSet: { usedCheckoutSessions: session_id }
            },
            { new: true }
        );
        
        // If user is null, it means the session_id is already in usedCheckoutSessions
        if (!user) {
            return res.status(400).json({ error: 'This payment has already been processed.' });
        }
        
        return res.json({ success: true, newBalance: user.walletBalance });
    }
    
    res.status(400).json({ error: 'Payment not successful or invalid type.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['EMAIL_SUCCESS', 'EMAIL_FAILURE', 'SYSTEM_ERROR', 'PAYMENT_ALERT', 'USER_LOGIN', 'USER_REGISTER', 'ORDER_SUCCESS', 'WALLET_UPDATE', 'USER_BLOCK'] 
  },
  level: { 
    type: String, 
    default: 'info',
    enum: ['info', 'warn', 'error']
  },
  module: { type: String, required: true }, // e.g., 'Mailer', 'Stripe', 'Fulfillment'
  message: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed }, // JSON for technical error data
  metadata: {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    provider: { type: String }, // 'Resend', 'SMTP'
    recipient: { type: String }
  },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SystemLog', systemLogSchema);

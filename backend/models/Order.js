const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    price: Number,
    quantity: Number,
    imageUrl: String,
    keys: [{
      value: String,
      keyType: { type: String, enum: ['text', 'image'], default: 'text' }
    }],
    activationSteps: String
  }],
  totalAmount: { type: Number, required: true },
  deliveredKey: { type: String }, // For legacy/backward compatibility (summary of all keys)
  status: { type: String, enum: ['success', 'pending', 'failed'], default: 'pending' },
  stripeSessionId: { type: String },
  cardLast4: { type: String }, // 💳 Added for professional invoicing
  cardBrand: { type: String }, // 💳 Added for professional invoicing
  securityPin: { type: String }, // 🔒 4-digit PIN for tracking securely
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' } // Keep for backward compatibility
}, { timestamps: true });

// Auto-generate 4-digit tracking PIN
orderSchema.pre('save', function(next) {
  if (!this.securityPin) {
      this.securityPin = Math.floor(1000 + Math.random() * 9000).toString();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);

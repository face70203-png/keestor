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
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' } // Keep for backward compatibility
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

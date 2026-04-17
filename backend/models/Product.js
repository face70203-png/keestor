const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: null }, // Set by admin for discounts. null = no discount.
  saleEndDate: { type: Date }, // ⏱️ New field for Flash Sales
  category: { type: String, default: 'General' },
  imageUrl: { type: String, default: '' },
  qrCodeUrl: { type: String, default: '' }, // 🤳 QR code image for the product
  activationSteps: { type: String, default: '' }, // 📖 Instructions for how to use/activate
  keys: [{ 
    value: { type: String }, // The actual key (text or image URL)
    keyType: { type: String, enum: ['text', 'image'], default: 'text' } 
  }] 
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

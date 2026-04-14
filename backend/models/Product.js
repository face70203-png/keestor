const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: null }, // Set by admin for discounts. null = no discount.
  saleEndDate: { type: Date }, // ⏱️ New field for Flash Sales
  category: { type: String, default: 'General' },
  imageUrl: { type: String, default: '' },
  keys: [{ type: String }] // Array of digital keys (text, license, etc.)
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

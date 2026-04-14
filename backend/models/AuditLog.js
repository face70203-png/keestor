const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminName: { type: String, required: true },
  action: { type: String, required: true }, // e.g., 'CREATE_PRODUCT', 'DELETE_USER', 'UPDATE_PRICE'
  details: { type: String }, // e.g., 'Changed price of Product X from 50 to 45'
  targetId: { type: mongoose.Schema.Types.ObjectId },
  ip: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);

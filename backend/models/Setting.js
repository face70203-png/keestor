const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    platformName: { type: String, default: 'KeeStore' },
    platformTagline: { type: String, default: 'Premium Digital Assets' },
    supportEmail: { type: String, default: 'support@keestore.app' },
    supportPhone: { type: String, default: '' },
    currencySymbol: { type: String, default: '$' },
    maintenanceMode: { type: Boolean, default: false },
    primaryColor: { type: String, default: '#3b82f6' }, // Default blue
    footerText: { type: String, default: 'The most secure, lightning-fast platform for premium digital keys and software assets.' },
    announcement: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);

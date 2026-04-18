const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, adminAuth } = require('../middleware/auth');
const Setting = require('../models/Setting');
const logSecurityEvent = require('../utils/logger');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      const dir = path.join(__dirname, '../../frontend/public');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
  },
  filename: function(req, file, cb) {
      cb(null, 'logo.png'); // Always overwrite logo.png
  }
});
const upload = multer({ storage });

// @route   GET /api/settings
// @desc    Get global platform settings
router.get('/', async (req, res) => {
    try {
        let count = await Setting.countDocuments();
        if (count > 1) {
            // Self-healing: Remove duplicates and keep only the latest
            const latest = await Setting.findOne().sort({ updatedAt: -1 });
            await Setting.deleteMany({ _id: { $ne: latest._id } });
        }

        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({});
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/settings
// @desc    Update global platform settings
router.put('/', adminAuth, async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create(req.body);
        } else {
            settings = await Setting.findOneAndUpdate({}, req.body, { new: true });
        }

        // 🛡️ Security Audit Log
        await logSecurityEvent({
            userId: req.user._id,
            action: 'SETTINGS_UPDATE',
            details: req.body,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            severity: 'high'
        });

        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/logo', adminAuth, upload.single('logo'), async (req, res) => {
    try {
        res.json({ success: true, message: 'Logo successfully updated. Refresh the page to see changes.' });
    } catch(err) {
        res.status(500).json({error: err.message});
    }
});

module.exports = router;

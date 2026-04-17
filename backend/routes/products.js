const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AuditLog = require('../models/AuditLog');

// Helper for logging
const logAdminAction = async (req, action, details, targetId) => {
  try {
    await AuditLog.create({
      adminId: req.user._id,
      adminName: req.user.username,
      action,
      details,
      targetId,
      ip: req.ip
    });
  } catch (err) {
    console.error("Failed to log admin action:", err);
  }
};

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper for Cloudinary Upload
const uploadToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, { folder: 'keestore_products' }, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
  });
};

// Simple In-Memory Cache for Products
let cachedProducts = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

// Clear Cache Helper
const clearPCache = () => {
    cachedProducts = null;
    lastCacheUpdate = 0;
};

// Get all products
router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedProducts && (now - lastCacheUpdate < CACHE_TTL)) {
        return res.json(cachedProducts);
    }

    const products = await Product.find().sort({ createdAt: -1 });
    cachedProducts = products;
    lastCacheUpdate = now;
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔍 Live Search Endpoint
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    const products = await Product.find({
      title: { $regex: query, $options: 'i' }
    }).select('title price imageUrl category keys saleEndDate');

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin ONLY routes
// Add a target product
router.post('/', adminAuth, upload.single('image'), async (req, res) => { // Upload single image field
  try {
    // Check if req.file exists
    let finalizedImageUrl = req.body.imageUrl || '';
    if (req.file) {
       try {
         finalizedImageUrl = await uploadToCloudinary(req.file.path);
         // Optionally remove the local file after upload to Cloudinary
         fs.unlinkSync(req.file.path);
       } catch (cloudErr) {
         console.error("Cloudinary Upload Error:", cloudErr);
         return res.status(500).json({ error: 'Image upload to Cloudinary failed.' });
       }
    }

    const priceNum = parseFloat(req.body.price);

    const product = new Product({
      title: req.body.title,
      description: req.body.description,
      price: isNaN(priceNum) ? 0 : priceNum,
      category: req.body.category || 'General',
      imageUrl: finalizedImageUrl,
      saleEndDate: req.body.saleEndDate || null
    });
    
    await product.save();
    await logAdminAction(req, 'CREATE_PRODUCT', `Created product: ${product.title}`, product._id);
    clearPCache();
    res.json(product);
  } catch (error) {
    console.error("error posting product", error);
    res.status(500).json({ error: error.message });
  }
});

// Add keys to a product (Admin only)
router.post('/:id/keys', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
     // keys expected to be an array of { value, keyType } or strings
     if (Array.isArray(req.body.keys)) {
        const processedKeys = req.body.keys.map(k => {
            if (typeof k === 'string') return { value: k, keyType: 'text' };
            return k; // Assume already { value, keyType }
        });
        product.keys = [...product.keys, ...processedKeys];
        await product.save();
        clearPCache();
        res.json(product);
     } else {
        res.status(400).json({ error: 'Keys must be an array' });
     }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Overwrite all keys for a product (Admin only)
router.put('/:id/keys/overwrite', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    if (Array.isArray(req.body.keys)) {
        const processedKeys = req.body.keys.map(k => {
            if (typeof k === 'string') return { value: k, keyType: 'text' };
            return k;
        });
        product.keys = processedKeys;
        await product.save();
        clearPCache();
        res.json(product);
    } else {
        res.status(400).json({ error: 'Keys must be an array' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Product
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
       try {
         updateData.imageUrl = await uploadToCloudinary(req.file.path);
         fs.unlinkSync(req.file.path);
       } catch (cloudErr) {
         console.error("Cloudinary Update Error:", cloudErr);
         return res.status(500).json({ error: 'Image update to Cloudinary failed.' });
       }
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    await logAdminAction(req, 'UPDATE_PRODUCT', `Updated product: ${product.title}`, product._id);
    clearPCache();
    res.json(product);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await logAdminAction(req, 'DELETE_PRODUCT', `Deleted product: ${product.title}`, product._id);
    }
    await Product.findByIdAndDelete(req.params.id);
    clearPCache();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

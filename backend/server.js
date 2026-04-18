const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const walletRoutes = require('./routes/wallet');
const userRoutes = require('./routes/users');
const couponRoutes = require('./routes/coupons');
const ticketRoutes = require('./routes/tickets');
const settingsRoutes = require('./routes/settings');
const reviewRoutes = require('./routes/reviews');
const analyticsRoutes = require('./routes/analytics');
const contactRoutes = require('./routes/contact');
const diagnosticRoutes = require('./routes/diagnostics');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');

const app = express();
const path = require('path');

// 🏁 Pre-Flight / CORS Headers (VERY TOP)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Auto-detection and Environment Variable support
    const allowedOrigins = [
        'http://localhost:3000',
        'https://keestore.vercel.app',
        'http://localhost', // Android Capacitor
        'capacitor://localhost', // iOS Capacitor
        'https://localhost' // Some Capacitor builds
    ];
    
    if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
    
    // 🛡️ CRITICAL CORS LOGIC FOR MOBILE:
    // When using Credentials (cookies), the origin MUSt be mirrored exactly. 
    // It cannot be "*".
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com'))) {
        res.header('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
        // For mobile apps that don't send an origin, we pick a default or use "*" if no credentials.
        // But since we use credentials, we'll try to guess or allow based on other headers, 
        // or just mirror a default allowed one for the handshake.
        res.header('Access-Control-Allow-Origin', allowedOrigins[2]); // Default to http://localhost
    }
    
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true'); 
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(cookieParser()); // Enable Cookie Parsing

// 🛡️ Security Middlewares
app.use(mongoSanitize()); // Prevent NoSQL Injection

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, // Increased from 5 to 20 for easier owner testing
  message: { error: 'Too many login/register attempts. Please wait 15 minutes.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Use JSON parser for all routes except Stripe Webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/api/orders/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // --- ADMIN ACCOUNT & MASSIVE DEMO SEEDER ---
    const Product = require('./models/Product');
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');

    // 1. Create Admin Account if it doesn't exist
    const adminExists = await User.findOne({ email: 'yassinkhaled193@gmail.com' });
    if (!adminExists) {
      console.log('Creating Root Admin account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Yassin980@', salt);
      await User.create({
         username: 'Admin',
         email: 'yassinkhaled193@gmail.com',
         password: hashedPassword,
         role: 'admin',
         isEmailVerified: true 
      });
      console.log('Admin account created: yassinkhaled193@gmail.com');
    }

    // 2. Create Demo Admin Account if it doesn't exist
    const demoExists = await User.findOne({ email: 'demo@keestore.app' });
    if (!demoExists) {
      console.log('Creating Demo Admin account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Guest123456', salt);
      await User.create({
         username: 'DemoAdmin',
         email: 'demo@keestore.app',
         password: hashedPassword,
         role: 'admin',
         isEmailVerified: true 
      });
      console.log('Demo Admin account created: demo@keestore.app');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/diagnostics', diagnosticRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

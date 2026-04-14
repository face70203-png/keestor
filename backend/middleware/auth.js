const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  // 🍪 Check Cookie first (HttpOnly) or then Authorization Header (legacy/API)
  let token = req.cookies?.token;
  
  if (!token && req.header('Authorization')) {
      token = req.header('Authorization').replace('Bearer ', '');
  }

  if (!token) return res.status(401).json({ error: 'Access denied. No session token found.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid or expired session token.' });
  }
}

function adminAuth(req, res, next) {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
  });
}

module.exports = { auth, adminAuth };

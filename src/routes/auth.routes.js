const express = require('express');
const jwt = require('jsonwebtoken');
const { passport, verifyToken } = require('../middleware/auth.middleware');
const router = express.Router();

// Google OAuth login route
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
    // Create JWT token
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Redirect based on role
    switch(req.user.role) {
      case 'admin':
        return res.redirect('/admin/dashboard');
      case 'freelancer':
        return res.redirect('/freelancer/dashboard');
      case 'client':
        return res.redirect('/client/dashboard');
      case 'pending':
      default:
        return res.redirect('/pending-approval');
    }
  }
);

// Login failed route
router.get('/login-failed', (req, res) => {
  res.status(401).json({ 
    success: false, 
    message: 'Login failed' 
  });
});

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  req.logout(() => {
    res.redirect('/');
  });
});

// Get current user information
router.get('/me', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

// Route to check authentication status
router.get('/status', (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(200).json({ isAuthenticated: false });
  }
  
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ isAuthenticated: true });
  } catch (err) {
    return res.status(200).json({ isAuthenticated: false });
  }
});

module.exports = router;
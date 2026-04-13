const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Note: For demonstration purposes, allowing open registration mapping to roles
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, reference_id } = req.body;
    
    // In a real app we would hash passwords
    const user = new User({ email, password, role, reference_id });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role, reference_id: user.reference_id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: MAX_AGE,
      sameSite: 'lax'
    });
    
    res.json({
      message: 'Login successful',
      user: { id: user._id, email: user.email, role: user.role, reference_id: user.reference_id }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', async (req, res) => {
    try {
      const token = req.cookies?.token;
      if (!token) return res.status(401).json({ error: 'Not authenticated' });
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      res.json({ user: decoded });
    } catch(err) {
      res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;

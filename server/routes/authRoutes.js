const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    let user = await User.findOne({ firebaseUid: req.user.uid });
    
    // Auto-create if doesn't exist yet
    if (!user) {
      user = new User({
        firebaseUid: req.user.uid,
        username: req.user.name || req.user.email?.split('@')[0] || 'User',
        email: req.user.email,
        provider: req.user.firebase?.sign_in_provider || 'unknown',
        avatarId: 'pingo'
      });
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create or update user after login/signup
router.post('/sync', verifyToken, async (req, res) => {
  try {
    const { username, avatarId } = req.body;
    let user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      user = new User({
        firebaseUid: req.user.uid,
        username: username || req.user.name || req.user.email.split('@')[0],
        email: req.user.email,
        provider: req.user.firebase.sign_in_provider,
        avatarId: avatarId || 'pingo'
      });
    } else {
      if (username) user.username = username;
      if (avatarId) user.avatarId = avatarId;
    }
    
    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

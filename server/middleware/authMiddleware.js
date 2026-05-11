const admin = require('../firebaseAdmin');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const socketAuth = async (socket, next) => {
  try {
    const { token, isGuest, username, avatarId } = socket.handshake.auth;

    if (isGuest) {
      // Guest mode - valid
      socket.user = { isGuest: true, username: username || 'Guest_' + Math.floor(Math.random() * 1000), avatarId: avatarId || 'pingo' };
      return next();
    }

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find or create user in DB
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      user = new User({
        firebaseUid: decodedToken.uid,
        username: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        email: decodedToken.email,
        provider: decodedToken.firebase.sign_in_provider,
        avatarId: avatarId || 'pingo'
      });
      await user.save();
    }

    socket.user = {
      isGuest: false,
      uid: user.firebaseUid,
      username: user.username,
      avatarId: user.avatarId,
      dbId: user._id
    };
    
    next();
  } catch (error) {
    console.error('Socket Auth Error:', error.message);
    next(new Error('Auth failed: ' + error.message));
  }
};

module.exports = { verifyToken, socketAuth };

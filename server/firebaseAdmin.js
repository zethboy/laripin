const admin = require('firebase-admin');
require('dotenv').config();

try {
  // If FIREBASE_PRIVATE_KEY is in .env, we use credential.cert
  if (process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace literal \n with actual newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    });
  } else {
    // Fallback to default
    admin.initializeApp({
      credential: admin.credential.applicationDefault() 
    });
  }
} catch (error) {
  console.warn('Firebase Admin init error:', error.message);
}

module.exports = admin;

const mongoose = require('mongoose');
const admin = require('./firebaseAdmin');
require('dotenv').config();

async function test() {
  console.log("Testing Firebase Admin...");
  try {
    // Just try to access a service to see if initialized
    admin.auth();
    console.log("Firebase Admin OK");
  } catch (err) {
    console.log("Firebase Admin FAILED: ", err.message);
  }

  console.log("Testing MongoDB...");
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/burjaw';
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
    console.log("MongoDB OK");
    await mongoose.disconnect();
  } catch (err) {
    console.log("MongoDB FAILED: ", err.message);
  }
  process.exit(0);
}

test();

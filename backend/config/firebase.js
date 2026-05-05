const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
let messaging = null;

try {
  // Try to load the service account file
  const serviceAccount = require('../firebase-service-account.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  messaging = admin.messaging();
  console.log('✅ Firebase Admin initialized successfully with FCM');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  // Fallback for development if file doesn't exist
  if (process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    messaging = admin.messaging();
    console.log('✅ Firebase Admin initialized from environment variables with FCM');
  } else {
    throw error;
  }
}

// Initialize Firestore
const db = admin.firestore();

// Initialize Auth
const auth = admin.auth();

module.exports = { admin, db, auth, messaging };
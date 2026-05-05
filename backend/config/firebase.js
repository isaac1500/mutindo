const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let db, auth, messaging = null;

// Check if running on Railway (production with environment variables)
if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
  try {
    // Use environment variables (Railway)
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    messaging = admin.messaging();
    console.log('✅ Firebase Admin initialized from environment variables with FCM');
  } catch (error) {
    console.error('❌ Error initializing Firebase from env:', error.message);
  }
} else {
  // Local development - try to use service account file
  try {
    const serviceAccount = require('../firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    messaging = admin.messaging();
    console.log('✅ Firebase Admin initialized from service account file with FCM');
  } catch (error) {
    console.error('❌ Error initializing Firebase from file:', error.message);
    console.log('⚠️ Firebase will not be available - check your credentials');
  }
}

// Initialize services if admin is initialized
if (admin.apps.length > 0) {
  db = admin.firestore();
  auth = admin.auth();
  if (!messaging) {
    try {
      messaging = admin.messaging();
    } catch (e) {
      console.log('⚠️ FCM not available');
    }
  }
} else {
  console.log('❌ Firebase Admin failed to initialize');
}

module.exports = { admin, db, auth, messaging };
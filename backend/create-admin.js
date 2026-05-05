const { auth, db } = require('./config/firebase');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const email = 'admin@mutindo.com';
    const password = 'Admin123!';
    const name = 'Isooba Nathan';
    const phone = '+256700000000';
    
    // Check if admin exists
    const existingUser = await db.collection('users').where('email', '==', email).get();
    
    if (!existingUser.empty) {
      console.log('Admin user already exists!');
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create admin in Firebase Auth
    let firebaseUid = null;
    try {
      const firebaseUser = await auth.createUser({
        email,
        password,
        displayName: name,
        phoneNumber: phone
      });
      firebaseUid = firebaseUser.uid;
      console.log('Firebase Auth user created:', firebaseUid);
    } catch (e) {
      console.log('Firebase Auth note:', e.message);
    }
    
    // Create admin in Firestore
    const adminRef = db.collection('users').doc();
    const admin = {
      userId: adminRef.id,
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'admin',
      firebaseUid,
      loyaltyPoints: 0,
      isActive: true,
      addresses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await adminRef.set(admin);
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@mutindo.com');
    console.log('Password: Admin123!');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('Error creating admin:', error.message);
  }
}

createAdmin();

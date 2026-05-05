const { auth, db } = require('./config/firebase');
const bcrypt = require('bcryptjs');

async function createUsers() {
  console.log('Creating users...\n');
  
  const users = [
    {
      name: 'Isooba Nathan',
      email: 'admin@mutindo.com',
      phone: '+256700000000',
      password: 'Admin123!',
      role: 'admin'
    },
    {
      name: 'John Doe',
      email: 'john@test.com',
      phone: '+256700000001',
      password: 'password123',
      role: 'customer'
    },
    {
      name: 'James Rider',
      email: 'rider@mutindo.com',
      phone: '+256700000002',
      password: 'rider123',
      role: 'rider'
    }
  ];
  
  for (const user of users) {
    try {
      // Check if user exists
      const existing = await db.collection('users').where('email', '==', user.email).get();
      
      if (!existing.empty) {
        console.log(`⚠️  User ${user.email} already exists, deleting...`);
        const docId = existing.docs[0].id;
        await db.collection('users').doc(docId).delete();
        console.log(`   Deleted ${user.email}`);
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      // Create user in Firestore
      const userRef = db.collection('users').doc();
      const newUser = {
        userId: userRef.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: hashedPassword,
        role: user.role,
        loyaltyPoints: 0,
        isActive: true,
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await userRef.set(newUser);
      console.log(`✅ Created: ${user.email} (${user.role})`);
      
      // Also create in Firebase Auth (optional)
      try {
        await auth.createUser({
          email: user.email,
          password: user.password,
          displayName: user.name,
          phoneNumber: user.phone
        });
      } catch (authError) {
        console.log(`   Note: Firebase Auth user may already exist`);
      }
      
    } catch (error) {
      console.error(`❌ Error creating ${user.email}:`, error.message);
    }
  }
  
  console.log('\n✅ All users created successfully!');
  console.log('\nLogin Credentials:');
  console.log('-------------------');
  console.log('Admin:    admin@mutindo.com / Admin123!');
  console.log('Customer: john@test.com / password123');
  console.log('Rider:    rider@mutindo.com / rider123');
  process.exit(0);
}

createUsers();

const dotenv = require('dotenv');
dotenv.config();

console.log('=' .repeat(50));
console.log('Testing Mutindo Backend Connections');
console.log('=' .repeat(50));

// Test Environment Variables
console.log('\n📋 Environment Variables Check:');
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'JWT_SECRET',
  'PORT'
];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    const value = process.env[varName];
    console.log(`   ✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`   ❌ ${varName}: MISSING`);
  }
});

// Test Firebase
console.log('\n🔥 Testing Firebase Connection...');
const { db, auth } = require('./config/firebase');

async function testFirebase() {
  try {
    // Try to write to Firestore
    const testRef = db.collection('test').doc('connection-test');
    await testRef.set({
      timestamp: new Date().toISOString(),
      message: 'Firebase connection successful'
    });
    console.log('   ✅ Firestore: Write successful');
    
    // Try to read
    const doc = await testRef.get();
    if (doc.exists) {
      console.log('   ✅ Firestore: Read successful');
    }
    
    console.log('   ✅ Firebase: All tests passed!');
    return true;
  } catch (error) {
    console.log('   ❌ Firebase Error:', error.message);
    return false;
  }
}

// Test Cloudinary
console.log('\n☁️  Testing Cloudinary Connection...');
const cloudinary = require('./config/cloudinary');

async function testCloudinary() {
  try {
    const result = await cloudinary.api.ping();
    if (result.status === 'ok') {
      console.log('   ✅ Cloudinary: Connection successful');
      console.log(`   ✅ Cloudinary Status: ${result.status}`);
      return true;
    }
    return false;
  } catch (error) {
    console.log('   ❌ Cloudinary Error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n' + '=' .repeat(50));
  console.log('Running Tests...');
  console.log('=' .repeat(50));
  
  const firebaseOk = await testFirebase();
  const cloudinaryOk = await testCloudinary();
  
  console.log('\n' + '=' .repeat(50));
  console.log('Test Results Summary');
  console.log('=' .repeat(50));
  console.log(`Firebase:  ${firebaseOk ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Cloudinary: ${cloudinaryOk ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (firebaseOk && cloudinaryOk) {
    console.log('\n🎉 All connections successful! Ready to start development.');
  } else {
    console.log('\n⚠️  Some connections failed. Please check your configuration.');
  }
  console.log('=' .repeat(50));
  
  // Exit the process
  process.exit(0);
}

// Run the tests with a timeout
const timeout = setTimeout(() => {
  console.log('\n⚠️  Tests took too long. Exiting...');
  process.exit(1);
}, 30000);

runTests().finally(() => {
  clearTimeout(timeout);
});
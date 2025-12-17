import bcrypt from 'bcrypt';
import { findUserByEmail } from './src/repositories/user.repo.js';

async function testLogin() {
  try {
    console.log('🔍 Testing login process...');
    
    const email = 'admin@pricechecker.com';
    const password = 'admin123';
    
    console.log(`📧 Looking for user: ${email}`);
    const user = await findUserByEmail(email);
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      passwordHash: user.password.substring(0, 10) + '...'
    });
    
    console.log(`🔐 Testing password: ${password}`);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log(`🔓 Password valid: ${isPasswordValid}`);
    
    if (isPasswordValid) {
      console.log('✅ Login should work!');
    } else {
      console.log('❌ Password mismatch - this is the issue');
      
      // Test creating a new hash
      const newHash = await bcrypt.hash(password, 10);
      console.log('🔄 Testing new hash...');
      const newHashValid = await bcrypt.compare(password, newHash);
      console.log(`🔓 New hash valid: ${newHashValid}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testLogin();
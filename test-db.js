import { prisma } from './src/db/prisma.js';
import bcrypt from 'bcrypt';

async function testAndSeed() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected successfully');
    
    // Check existing users
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count: ${userCount}`);
    
    // List existing users
    const users = await prisma.user.findMany();
    console.log('📋 Existing users:', users);
    
    // Create admin if not exists
    const adminEmail = 'admin@pricechecker.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!existingAdmin) {
      console.log('🌱 Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      });
      
      console.log('✅ Admin user created:', admin);
    } else {
      console.log('👤 Admin user already exists:', existingAdmin);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAndSeed();
import { prisma } from '../src/db/prisma.js';

async function checkAdminUsers() {
  try {
    console.log('Checking for admin users...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (users.length === 0) {
      console.log('❌ No admin users found in the database.');
      return;
    }

    console.log('✅ Found admin users:');
    console.log('='.repeat(50));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log('-'.repeat(30));
    });

    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    const superAdminCount = users.filter(u => u.role === 'SUPER_ADMIN').length;
    
    console.log('\n📊 Summary:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Super Admins: ${superAdminCount}`);

  } catch (error) {
    console.error('❌ Error checking admin users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();
import { prisma } from '../src/db/prisma.js';
import bcrypt from 'bcrypt';
import { logger } from '../src/utils/logger.js';

/**
 * Seed the database with initial data
 */
async function seedDatabase() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Create a default super admin user
    const adminEmail = 'admin@pricechecker.com';
    const adminPassword = 'admin123'; // Change this in production!
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          role: 'SUPER_ADMIN',
          isActive: true,
        }
      });

      logger.info(`✅ Created admin user: ${adminEmail} (password: ${adminPassword})`);
    } else {
      logger.info('Admin user already exists, skipping creation');
    }

    // Create sample store categories (if any specific categories are needed)
    logger.info('✅ Database seeding completed');
    
    // Log some statistics
    const userCount = await prisma.user.count();
    const storeCount = await prisma.store.count();
    const productCount = await prisma.product.count();
    const priceCount = await prisma.price.count();

    logger.info('📊 Database Statistics:');
    logger.info(`   Users: ${userCount}`);
    logger.info(`   Stores: ${storeCount}`);
    logger.info(`   Products: ${productCount}`);
    logger.info(`   Prices: ${priceCount}`);

  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
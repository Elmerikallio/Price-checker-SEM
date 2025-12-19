import { prisma } from './src/db/prisma.js';

async function checkActiveStore() {
  try {
    const activeStore = await prisma.store.findFirst({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, email: true }
    });
    
    if (activeStore) {
      console.log('Active store found:');
      console.log('ID:', activeStore.id);
      console.log('Name:', activeStore.name);
      console.log('Email:', activeStore.email);
    } else {
      console.log('No active store found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkActiveStore();
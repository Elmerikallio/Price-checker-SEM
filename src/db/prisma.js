import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

// Export disconnect function for graceful shutdown
export const disconnectDatabase = async () => {
  logger.info('Disconnecting from database...');
  await prisma.$disconnect();
};

export { prisma };

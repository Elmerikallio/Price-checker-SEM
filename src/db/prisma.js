import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting from database...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };

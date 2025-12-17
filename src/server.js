import dotenv from "dotenv";
import app, { initializeApp } from "./app.js";
import { logger } from "./utils/logger.js";
import { disconnectDatabase } from "./db/prisma.js";

dotenv.config();

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database connection and check setup
    await initializeApp();
    
    // Start the server and store the server instance
    const server = app.listen(port, () => {
      logger.info(`🚀 Server running on http://localhost:${port}`);
      logger.info(`📚 API Documentation: http://localhost:${port}/api/v1/health`);
    });

    // Handle graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received, starting graceful shutdown...`);
      
      server.close(async (err) => {
        if (err) {
          logger.error('Error during server close:', err);
          process.exit(1);
        }
        
        logger.info('Server closed successfully');
        await disconnectDatabase();
        process.exit(0);
      });
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

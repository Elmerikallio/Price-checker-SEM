import dotenv from "dotenv";
import app, { initializeApp } from "./app.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database connection and check setup
    await initializeApp();
    
    // Start the server
    app.listen(port, () => {
      logger.info(`🚀 Server running on http://localhost:${port}`);
      logger.info(`📚 API Documentation: http://localhost:${port}/api/v1/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

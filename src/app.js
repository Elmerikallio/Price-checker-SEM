import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import v1Router from "./routes/v1/index.js";
import { testDatabaseConnection, initializeDatabase } from "./utils/database.js";
import { logger } from "./utils/logger.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/v1", v1Router);

// 404 handler for unmatched routes
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database connection on startup
export async function initializeApp() {
  const dbConnected = await testDatabaseConnection();
  if (dbConnected) {
    await initializeDatabase();
  } else {
    logger.error('Failed to connect to database. Please check your DATABASE_URL');
    process.exit(1);
  }
}

export default app;

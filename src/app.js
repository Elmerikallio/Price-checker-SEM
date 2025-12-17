import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import v1Router from "./routes/v1/index.js";
import { testDatabaseConnection, initializeDatabase } from "./utils/database.js";
import { logger } from "./utils/logger.js";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Price Checker API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// API JSON endpoint for raw swagger spec
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

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

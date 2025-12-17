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

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Price Checker API',
    version: '1.0.0',
    description: 'A comprehensive price comparison API for shoppers and store users',
    documentation: {
      swagger: `${req.protocol}://${req.get('host')}/api-docs`,
      json: `${req.protocol}://${req.get('host')}/api-docs.json`
    },
    endpoints: {
      health: '/api/v1/health',
      authentication: '/api/v1/auth',
      admin: '/api/v1/admin',
      stores: '/api/v1/stores',
      prices: '/api/v1/prices'
    },
    functionalRequirements: {
      userManagement: 'Full admin control over store user accounts',
      discountManagement: 'Store users can offer app-exclusive discounts',
      locationMapping: 'Comprehensive location-store mapping system',
      priceComparison: 'Real-time price comparison across nearby stores',
      batchOperations: 'Bulk price update capabilities for store users',
      security: 'HTTPS, JWT authentication, audit logging'
    }
  });
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
    logger.info('Database connected successfully');
  } else {
    // In development mode or for Swagger documentation, allow running without database
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_NO_DB === 'true') {
      logger.warn('Database connection failed, but continuing in development mode');
      logger.warn('Some API endpoints will not work without database connection');
    } else {
      logger.error('Failed to connect to database. Please check your DATABASE_URL');
      process.exit(1);
    }
  }
}

export default app;

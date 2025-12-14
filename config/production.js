// Production Configuration
export default {
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    keepAliveTimeout: 65000,
    headersTimeout: 66000
  },
  
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100
    }
  },
  
  security: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    bcrypt: {
      rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
    },
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || false,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: 'Too many requests from this IP, please try again later.'
      }
    }
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'warn',
    format: 'json',
    timestamp: true,
    colorize: false,
    handleExceptions: true,
    handleRejections: true,
    exitOnError: false
  },
  
  monitoring: {
    healthCheck: {
      path: '/api/v1/health',
      interval: 30000
    },
    metrics: {
      enabled: true,
      path: '/metrics'
    }
  }
};
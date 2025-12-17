import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  // Server Configuration
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().int().positive().default(3000),

  // Database Configuration
  DATABASE_URL: z.string().min(1),

  // Authentication & Security
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("24h"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

  // Logging
  LOG_LEVEL: z.string().default("info"),

  // API Configuration
  API_VERSION: z.string().default("v1"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // CORS Configuration
  CORS_ORIGIN: z.string().default("*"),

  // Geolocation & Distance
  DEFAULT_SEARCH_RADIUS_KM: z.coerce.number().default(5),
  MAX_SEARCH_RADIUS_KM: z.coerce.number().default(50),

  // Optional Development Features
  USE_MOCK_DB: z.string().optional(),
  ALLOW_NO_DB: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);

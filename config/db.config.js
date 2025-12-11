// config/db.config.js
require('dotenv').config();

module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "password",
  DB: process.env.DB_NAME || "price_checker_db",
  dialect: "mysql",
  pool: {
    max: 5,     // Maximum number of connection in pool
    min: 0,     // Minimum number of connection in pool
    acquire: 30000, // Maximum time (ms), that pool will try to get connection before throwing error
    idle: 10000  // Maximum time (ms), that a connection can be idle before being released
  }
};
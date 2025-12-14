// src/config/db.config.js
import "dotenv/config";

const DB = {
  HOST: process.env.DB_HOST ?? "localhost",
  USER: process.env.DB_USER ?? "root",
  PASSWORD: process.env.DB_PASSWORD ?? "password",
  NAME: process.env.DB_NAME ?? "price_checker_db",
  PORT: process.env.DB_PORT ?? "3306",
};

export default DB;

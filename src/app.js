import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";

dotenv.config();

import { errorHandler } from "./middleware/errorHandler.js";
import { routes } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/v1", routes);

  // last
  app.use(errorHandler);

  return app;
}

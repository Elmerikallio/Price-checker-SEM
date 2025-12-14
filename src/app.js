import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middleware/errorHandler.js";
import v1Router from "./routes/v1/index.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/v1", v1Router);

app.use(errorHandler);

export default app;

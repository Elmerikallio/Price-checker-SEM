// src/routes/v1/index.js
import { Router } from "express";
import priceRouter from "./prices.routes.js";

const router = Router();

router.use("/prices", priceRouter);

export default router;

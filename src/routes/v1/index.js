import { Router } from "express";
import healthRouter from "./health.routes.js";
import pricesRouter from "./prices.routes.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/prices", pricesRouter);

export default router;

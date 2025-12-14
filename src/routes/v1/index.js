import { Router } from "express";

import adminRouter from "./admin.routes.js";
import authRouter from "./auth.routes.js";
import healthRouter from "./health.routes.js";
import pricesRouter from "./prices.routes.js";
import storesRouter from "./stores.routes.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/prices", pricesRouter);
router.use("/stores", storesRouter);
router.use("/auth", authRouter);
router.use("/admin", adminRouter);

export default router;

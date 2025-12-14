// src/routes/v1/prices.routes.js
import { Router } from "express";
import { getNearbyPrices } from "../../controllers/prices.controller.js";

const router = Router();

router.get("/nearby", getNearbyPrices);

export default router;

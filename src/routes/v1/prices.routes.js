import { Router } from "express";
import {
  getNearbyPrices,
  submitObservation,
} from "../../controllers/prices.controller.js";

const router = Router();

// For browser testing: GET /api/v1/prices/nearby?gtin=...&lat=...&lng=...
router.get("/nearby", getNearbyPrices);

// For app: POST /api/v1/prices/observations
router.post("/observations", submitObservation);

export default router;

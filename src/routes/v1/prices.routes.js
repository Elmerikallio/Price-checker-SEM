import { Router } from "express";
import {
  getNearbyPrices,
  submitObservedPrice,
} from "../../controllers/prices.controller.js";

const router = Router();

// Shopper -> send observed price + location + barcode
router.post("/observe", submitObservedPrice);
router.post("/compare", getNearbyPrices);
// Shopper -> query nearby prices
router.get("/nearby", getNearbyPrices);

export default router;

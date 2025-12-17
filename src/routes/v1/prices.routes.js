import { Router } from "express";
import {
  getNearbyPrices,
  submitObservation,
  getProductPriceHistory,
  getStorePrices,
  submitBatchObservations,
  submitProductPriceList
} from "../../controllers/prices.controller.js";
import { requireAuth, requireStore, optionalAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { priceObservationSchema, storeProductPriceSchema } from "../../schemas/prices.schema.js";

const router = Router();

// Public routes (with optional authentication for better data)
router.get("/nearby", optionalAuth, getNearbyPrices);
router.get("/product/:barcode", getProductPriceHistory);
router.get("/product/:barcode/:barcodeType", getProductPriceHistory);

// Protected routes (require authentication)
router.post("/observations", 
  requireAuth, 
  validate(priceObservationSchema), 
  submitObservation
);

// Store-only routes
router.get("/store/prices", requireStore, getStorePrices);
router.post("/batch", requireStore, submitBatchObservations);
router.post("/products", requireStore, validate(storeProductPriceSchema), submitProductPriceList);

export default router;

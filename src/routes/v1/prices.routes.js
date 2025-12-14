import { Router } from "express";
import { z } from "zod";

// Controllers (you’ll implement these next)
import {
  getNearbyPrices,
  submitObservation,
  uploadStorePricesBatch,
} from "../../controllers/prices.controller.js";

// Middlewares (your teammate may already be doing auth — this is just a hook)
import { requireAuth, requireRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";

const router = Router();

/**
 * Shared schemas
 */
const barcodeSchema = z.object({
  barcodeType: z.string().min(1), // e.g., "EAN_13", "UPC_A" etc.
  gtin: z.string().min(8).max(14), // keep flexible; tighten later if you want
});

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

/**
 * 1) Shopper submits an observation (scan)
 * Backend stores it, then (optionally) responds with nearby prices.
 * Requirement: receive barcode data, location, price, timestamp; validate & save.
 */
const submitObservationSchema = z.object({
  body: z.object({
    barcode: barcodeSchema,
    price: z.number().positive(),
    location: locationSchema,
    timestamp: z.string().datetime(), // ISO string, e.g. new Date().toISOString()
    // optional user prefs (commission mentions “nearby distance” etc.)
    prefs: z
      .object({
        nearbyKm: z.number().positive().max(200).optional(),
        currentWindowHours: z.number().positive().max(720).optional(),
      })
      .optional(),
  }),
});

/**
 * 2) Shopper asks: what are nearby prices for this product?
 * Requirement: return sorted list ascending by price + label.
 */
const getNearbyPricesSchema = z.object({
  query: z.object({
    barcodeType: z.string().min(1),
    gtin: z.string().min(8).max(14),
    lat: z.coerce.number().min(-90).max(90),
    lon: z.coerce.number().min(-180).max(180),
    nearbyKm: z.coerce.number().positive().max(200).optional(),
    currentWindowHours: z.coerce.number().positive().max(720).optional(),
  }),
});

/**
 * 3) Store user uploads prices in batch
 * Requirement: list of product-price info objects
 * Protected: store role
 */
const uploadStorePricesBatchSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          barcode: barcodeSchema,
          price: z.number().positive(),
          timestamp: z.string().datetime(),
        })
      )
      .min(1),
  }),
});

// --- Routes ---

// Shopper observation (can be anonymous or authed; choose what you want)
router.post(
  "/observations",
  validate(submitObservationSchema),
  submitObservation
);

// Shopper query nearby prices
router.get("/nearby", validate(getNearbyPricesSchema), getNearbyPrices);

// Store batch upload (requires login + role)
router.post(
  "/batch",
  requireAuth,
  requireRole("STORE"),
  validate(uploadStorePricesBatchSchema),
  uploadStorePricesBatch
);

export default router;

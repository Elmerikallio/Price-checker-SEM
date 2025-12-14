// src/controllers/prices.controller.js
import { z } from "zod";
import { prisma } from "../db/prisma.js";

// Basic input validation for the shopper compare endpoint :contentReference[oaicite:0]{index=0}
const nearbyPricesQuerySchema = z.object({
  barcodeType: z.string().min(1),
  gtin: z.string().min(8).max(14),
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(0.1).max(50).default(5),
  timestamp: z.string().datetime().optional(),
});

function priceLabel(prices, currentPrice) {
  // simple, transparent labeling rule (you can refine later)
  if (!prices.length) return "average";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const mid = (min + max) / 2;

  if (currentPrice <= min) return "very inexpensive";
  if (currentPrice < mid) return "inexpensive";
  if (currentPrice === mid) return "average";
  if (currentPrice < max) return "expensive";
  return "very expensive";
}

export async function getNearbyPrices(req, res, next) {
  try {
    const parsed = nearbyPricesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    const { barcodeType, gtin, lat, lon, radiusKm } = parsed.data;

    // The commission requires: find nearby stores selling same product and return sorted list
    const stores = await prisma.store.findMany({
      where: {
        // Placeholder: swap to a proper geo query approach later.
      },
      select: { id: true, name: true, lat: true, lon: true },
    });

    // Placeholder prices fetch (adapt to your schema)
    const prices = await prisma.priceObservation.findMany({
      where: {
        barcodeType,
        gtin,
        storeId: { in: stores.map((s) => s.id) },
        // "current" pricing definition will depend on your data model :contentReference[oaicite:2]{index=2}
      },
      orderBy: { price: "asc" },
      select: {
        price: true,
        store: { select: { name: true, lat: true, lon: true } },
      },
    });

    const priceValues = prices.map((p) => p.price);
    const label = priceLabel(priceValues, priceValues[0] ?? 0);

    return res.json({
      query: { barcodeType, gtin, lat, lon, radiusKm },
      label,
      results: prices.map((p) => ({
        storeName: p.store.name,
        location: { lat: p.store.lat, lon: p.store.lon },
        price: p.price,
      })),
    });
  } catch (err) {
    next(err);
  }
}

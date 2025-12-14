// DB-free mock logic

function priceLabel(price, allPrices) {
  // simple percentile label, replace later with real logic
  const sorted = [...allPrices].sort((a, b) => a - b);
  const idx = sorted.indexOf(price);
  const ratio = idx / Math.max(sorted.length - 1, 1);

  if (ratio <= 0.1) return "very inexpensive";
  if (ratio <= 0.3) return "inexpensive";
  if (ratio <= 0.7) return "average";
  if (ratio <= 0.9) return "expensive";
  return "very expensive";
}

export function getNearbyPrices(req, res) {
  const { gtin, lat, lng } = req.query;

  if (!gtin || !lat || !lng) {
    return res.status(400).json({
      error: "Missing query params. Required: gtin, lat, lng",
    });
  }

  // Mock “nearby store price list”
  const results = [
    {
      storeName: "K-Market Testi",
      location: { lat: Number(lat), lng: Number(lng) },
      price: 3.49,
    },
    {
      storeName: "S-Market Demo",
      location: { lat: Number(lat) + 0.002, lng: Number(lng) + 0.001 },
      price: 3.79,
    },
    {
      storeName: "Lidl Mock",
      location: { lat: Number(lat) - 0.003, lng: Number(lng) - 0.002 },
      price: 3.29,
    },
  ].sort((a, b) => a.price - b.price);

  const prices = results.map((r) => r.price);
  const currentStore = results[0]; // pretend cheapest is “current” for now

  res.json({
    product: { barcodeType: "GTIN", gtin: String(gtin) },
    currentStore,
    results,
    label: priceLabel(currentStore.price, prices),
  });
}

export function submitObservation(req, res) {
  const { barcodeType, gtin, lat, lng, price, timestamp } = req.body ?? {};

  if (!barcodeType || !gtin || lat == null || lng == null || price == null) {
    return res.status(400).json({
      error:
        "Missing fields. Required: barcodeType, gtin, lat, lng, price. Optional: timestamp",
    });
  }

  // No DB yet
  return res.status(201).json({
    saved: true,
    observation: {
      barcodeType,
      gtin,
      lat: Number(lat),
      lng: Number(lng),
      price: Number(price),
      timestamp: timestamp ?? new Date().toISOString(),
    },
  });
}

export async function submitObservedPrice(req, res) {
  // Later: validate + save
  return res.status(201).json({
    message: "Observed price received (stub)",
    received: req.body,
  });
}

export async function getNearbyPrices(req, res) {
  // Later: query DB + compute label + sort
  return res.status(200).json({
    product: {
      gtin: req.query.gtin ?? null,
      barcodeType: req.query.barcodeType ?? null,
    },
    results: [
      { storeName: "Stub Market", price: 1.99, distanceKm: 0.2 },
      { storeName: "Mock K-Market", price: 2.49, distanceKm: 0.6 },
    ],
    label: "average",
  });
}

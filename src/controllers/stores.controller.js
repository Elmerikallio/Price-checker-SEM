export function listStores(req, res) {
  // Mock store list (later comes from DB)
  res.json({
    stores: [
      { id: "store_1", name: "K-Market Testi", lat: 60.4518, lng: 22.2666 },
      { id: "store_2", name: "S-Market Demo", lat: 60.4538, lng: 22.2676 },
    ],
  });
}

// src/db/index.js  (ESM)
const useMock = process.env.USE_MOCK_DB === "true";

export const db = useMock
  ? {
      prices: {
        // simulate "nearby prices" query
        findNearbyByGtin: async ({ gtin, lat, lon, radiusKm }) => {
          // return mock “stores nearby” list
          return [
            {
              storeId: "s1",
              storeName: "K-Market Testi",
              lat: lat + 0.001,
              lon: lon + 0.001,
              price: 2.49,
              timestamp: new Date().toISOString(),
            },
            {
              storeId: "s2",
              storeName: "S-Market Demo",
              lat: lat - 0.002,
              lon: lon - 0.002,
              price: 2.79,
              timestamp: new Date().toISOString(),
            },
            {
              storeId: "s3",
              storeName: "Lidl Mock",
              lat: lat + 0.003,
              lon: lon - 0.001,
              price: 2.19,
              timestamp: new Date().toISOString(),
            },
          ];
        },

        // simulate “save scan”
        createScan: async (payload) => {
          return { id: "scan_mock_1", ...payload };
        },
      },
    }
  : await import("./prisma.js").then((m) => m.db);

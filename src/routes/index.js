import { Router } from "express";

export const routes = Router();

routes.get("/", (req, res) => {
  res.json({ name: "price-checker-backend", version: "v1" });
});

// later:
// routes.use("/auth", authRoutes);
// routes.use("/admin", adminRoutes);
// routes.use("/stores", storeRoutes);
// routes.use("/prices", pricesRoutes);

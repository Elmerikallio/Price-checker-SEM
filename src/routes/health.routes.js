// src/routes/health.routes.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "price-checker-backend",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

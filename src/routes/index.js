// src/routes/index.js
const express = require("express");
const healthRouter = require("./health.routes");

const router = express.Router();

router.use("/health", healthRouter);

// later
// router.use("/auth", require("./auth.routes"));
// router.use("/stores", require("./stores.routes"));
// router.use("/prices", require("./price.routes"));

module.exports = router;

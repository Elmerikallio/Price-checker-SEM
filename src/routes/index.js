// src/routes/index.js
const express = require("express");
const healthRouter = require("./health.routes");
const db = require("./models");
const router = express.Router();

router.use("/health", healthRouter);

db.sequelize.sync({ force: false, alter: true})
    .then(() => {
        console.log("Database synchronized");
    })
    .catch((err) => {
        console.error("Error synchronizing database:", err);
    });
// later
// router.use("/auth", require("./auth.routes"));
// router.use("/stores", require("./stores.routes"));
// router.use("/prices", require("./price.routes"));

module.exports = router;

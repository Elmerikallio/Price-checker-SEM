import { Router } from "express";
// import more routes here later

const router = Router();

router.use("/prices", priceRouter);
router.use("/stores", storeRouter);

export default router;

import { Router } from "express";
import { listStores } from "../../controllers/stores.controller.js";

const router = Router();
router.get("/", listStores);

export default router;

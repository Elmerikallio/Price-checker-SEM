import { Router } from "express";
import {
  approveStoreUser,
  lockStoreUser,
  removeStoreUser,
  unlockStoreUser,
} from "../../controllers/admin.controller.js";

const router = Router();

router.post("/store-users/:id/approve", approveStoreUser);
router.post("/store-users/:id/lock", lockStoreUser);
router.post("/store-users/:id/unlock", unlockStoreUser);
router.delete("/store-users/:id", removeStoreUser);

export default router;

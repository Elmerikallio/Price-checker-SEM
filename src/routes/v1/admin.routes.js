import { Router } from "express";
import {
  getAllStoresForAdmin,
  approveStoreUser,
  rejectStoreUser,
  lockStoreUser,
  unlockStoreUser,
  removeStoreUser,
  getAuditLogs,
  getSystemStats,
  createAdminUser
} from "../../controllers/admin.controller.js";
import { requireAuth, requireAdmin, requireSuperAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createUserSchema } from "../../schemas/auth.schema.js";

const router = Router();

// All admin routes require authentication first, then admin role check
router.use(requireAuth);
router.use(requireAdmin);

// Store management
router.get("/stores", getAllStoresForAdmin);
router.post("/stores/:id/approve", approveStoreUser);
router.post("/stores/:id/reject", rejectStoreUser);
router.post("/stores/:id/suspend", lockStoreUser);
router.post("/stores/:id/reactivate", unlockStoreUser);

// Super admin only routes
router.delete("/stores/:id", requireSuperAdmin, removeStoreUser);
router.post("/users", requireSuperAdmin, validate(createUserSchema), createAdminUser);

// Audit and statistics
router.get("/audit-logs", getAuditLogs);
router.get("/statistics", getSystemStats);

// Legacy routes (maintain backward compatibility)
router.post("/store-users/:id/approve", approveStoreUser);
router.post("/store-users/:id/lock", lockStoreUser);
router.post("/store-users/:id/unlock", unlockStoreUser);
router.delete("/store-users/:id", requireSuperAdmin, removeStoreUser);

export default router;

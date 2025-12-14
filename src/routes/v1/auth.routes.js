import { Router } from "express";
import {
  login,
  registerStoreSignup,
  logout,
  getProfile
} from "../../controllers/auth.controller.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

// Public routes
router.post("/login", login);
router.post("/signup-store", registerStoreSignup);

// Protected routes
router.post("/logout", requireAuth, logout);
router.get("/profile", requireAuth, getProfile);

export default router;

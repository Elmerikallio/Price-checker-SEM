import { Router } from "express";
import {
  login,
  registerStoreSignup,
} from "../../controllers/auth.controller.js";

const router = Router();
router.post("/login", login);
router.post("/signup-store", registerStoreSignup);

export default router;

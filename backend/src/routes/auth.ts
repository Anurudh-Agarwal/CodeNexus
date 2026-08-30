import express from "express";
import {
  signUp,
  logIn,
  logOut,
  verifyOtp,
  getCurrentUser,
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

router.get("/me", requireAuth, getCurrentUser);
router.post("/signup", signUp);
router.post("/verify-otp", verifyOtp);
router.post("/login", logIn);
router.post("/logout", logOut);

export default router;

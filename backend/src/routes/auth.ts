import express from "express";
import {
  signUp,
  logIn,
  logOut,
  verifyOtp,
} from "../controllers/authController";

const router = express.Router();

router.post("/signup", signUp);
router.post("/verify-otp", verifyOtp);
router.post("/login", logIn);
router.post("/logout", logOut);

export default router;

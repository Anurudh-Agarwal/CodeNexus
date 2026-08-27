import express from "express";
import { getUserProfile } from "../controllers/userController";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

router.get("/:userId", requireAuth, getUserProfile);

export default router;

import express from "express";
import { follow, unfollow } from "../controllers/followController";
import { requireAuth } from "../middleware/auth";

const router = express.Router()
router.post('/:userId', requireAuth, follow)
router.delete('/:userId',requireAuth, unfollow)

export default router
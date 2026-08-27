import express from "express";
import {
  requestCodeforcesSync,
  verifyCodeforcesSync,
  triggerResyncAll,
  getCodeforcesStatus,
  refreshOwnCodeforces,
  requestLeetCodeSync,
  verifyLeetCodeSync,
  getLeetCodeStatus,
  refreshOwnLeetCode,
  triggerResyncAllLeetCode,
  requestCodeChefSync,
  verifyCodeChefSync,
  getCodeChefStatus,
  refreshOwnCodeChef,
  triggerResyncAllCodeChef,
} from "../controllers/syncController";
import { requireAuth } from "../middleware/auth";
import { requireCronSecret } from "../middleware/requireCronSecret";

const router = express.Router();
router.post("/codeforces/request", requireAuth, requestCodeforcesSync);
router.post("/codeforces/verify", requireAuth, verifyCodeforcesSync);
router.post("/cron/resync-all", requireCronSecret, triggerResyncAll);
router.get("/codeforces/status", requireAuth, getCodeforcesStatus);
router.post("/codeforces/refresh", requireAuth, refreshOwnCodeforces);
router.post("/leetcode/request", requireAuth, requestLeetCodeSync);
router.post("/leetcode/verify", requireAuth, verifyLeetCodeSync);
router.get("/leetcode/status", requireAuth, getLeetCodeStatus);
router.post("/leetcode/refresh", requireAuth, refreshOwnLeetCode);
router.post(
  "/cron/resync-all-leetcode",
  requireCronSecret,
  triggerResyncAllLeetCode,
);
router.post("/codechef/request", requireAuth, requestCodeChefSync);
router.post("/codechef/verify", requireAuth, verifyCodeChefSync);
router.get("/codechef/status", requireAuth, getCodeChefStatus);
router.post("/codechef/refresh", requireAuth, refreshOwnCodeChef);
router.post(
  "/cron/resync-all-codechef",
  requireCronSecret,
  triggerResyncAllCodeChef,
);
export default router;

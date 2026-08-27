import { Request, Response } from "express";
import {
  requestCodeforcesVerification,
  verifyAndSyncCodeforces,
  refreshAllVerifiedCodeforcesUsers,
  getCodeforcesSyncStatus,
  refreshOwnCodeforcesStats,
} from "../services/syncService";

function errorDetails(error: unknown) {
  if (error instanceof Error) return { message: error.message };
  if (typeof error === "object" && error !== null) {
    const details = error as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };
    return {
      message: details.message || "Internal server error",
      code: details.code,
      details: details.details,
      hint: details.hint,
    };
  }
  return { message: "Internal server error" };
}

export async function requestCodeforcesSync(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { handle } = req.body;
    if (!handle || typeof handle !== "string" || !handle.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Codeforces handle is required" });
    }
    const { code, expiresAt } = await requestCodeforcesVerification(
      userId,
      handle.trim(),
    );
    res.status(200).json({
      success: true,
      data: {
        code,
        expiresAt,
        instructions:
          "Go to Codeforces → Settings → Social, paste this code as your First Name, save, then click Verify.",
      },
    });
  } catch (err) {
    const error = errorDetails(err);
    console.error("Request Verification error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }
}
export async function verifyCodeforcesSync(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const result = await verifyAndSyncCodeforces(userId);
    if (!result.verified) {
      console.warn("Codeforces verification failed:", {
        userId,
        error: result.error,
      });
      return res.status(422).json({ success: false, error: result.error });
    }
    res.status(200).json({
      success: true,
      data: { platform: "codeforces", synced: true, stats: result.stats },
    });
  } catch (err) {
    const error = errorDetails(err);
    console.error("Verify sync error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }
}

export async function triggerResyncAll(req: Request, res: Response) {
  res.status(202).json({ success: true, message: "Resync started" });

  refreshAllVerifiedCodeforcesUsers()
    .then((result) =>
      console.log(
        `Resync complete: ${result.succeeded}/${result.total} succeeded`,
      ),
    )
    .catch((err) => console.error("Resync job failed:", err));
}

export async function getCodeforcesStatus(req: Request, res: Response) {
  try {
    const status = await getCodeforcesSyncStatus(req.user!.id);
    res.status(200).json({ success: true, data: status });
  } catch (err) {
    console.error("Get sync status error: ", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function refreshOwnCodeforces(req: Request, res: Response) {
  try {
    const result = await refreshOwnCodeforcesStats(req.user!.id);
    if (!result.refreshed) {
      return res.status(429).json({ success: false, error: result.error });
    }
    res
      .status(200)
      .json({
        success: true,
        data: { platform: "codeforces", synced: true, stats: result.stats },
      });
  } catch (err) {
    console.error("Refresh error", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

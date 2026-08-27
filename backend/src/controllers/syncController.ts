import { Request, Response } from "express";
import {
  requestCodeforcesVerification,
  verifyAndSyncCodeforces,
  refreshAllVerifiedCodeforcesUsers,
  getCodeforcesSyncStatus,
  refreshOwnCodeforcesStats,
  requestLeetCodeVerification,
  verifyAndSyncLeetCode,
  getLeetCodeSyncStatus,
  refreshOwnLeetCodeStats,
  refreshAllVerifiedLeetCodeUsers,
  requestCodeChefVerification,
  verifyAndSyncCodeChef,
  getCodeChefSyncStatus,
  refreshOwnCodeChefStats,
  refreshAllVerifiedCodeChefUsers,
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
    res.status(200).json({
      success: true,
      data: { platform: "codeforces", synced: true, stats: result.stats },
    });
  } catch (err) {
    console.error("Refresh error", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function requestLeetCodeSync(req: Request, res: Response) {
  try {
    const handle = req.body?.handle;
    if (!handle || typeof handle !== "string" || !handle.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "LeetCode username is required" });
    }
    const result = await requestLeetCodeVerification(
      req.user!.id,
      handle.trim(),
    );
    return res.status(200).json({
      success: true,
      data: {
        ...result,
        instructions:
          "Go to LeetCode Profile → Edit Profile → Summary, paste this code, save, then click Verify.",
      },
    });
  } catch (err) {
    const error = errorDetails(err);
    console.error("LeetCode request verification error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }
}

export async function verifyLeetCodeSync(req: Request, res: Response) {
  try {
    const result = await verifyAndSyncLeetCode(req.user!.id);
    if (!result.verified)
      return res.status(422).json({ success: false, error: result.error });
    return res.status(200).json({
      success: true,
      data: { platform: "leetcode", synced: true, stats: result.stats },
    });
  } catch (err) {
    const error = errorDetails(err);
    console.error("LeetCode verify sync error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }
}

export async function getLeetCodeStatus(req: Request, res: Response) {
  try {
    return res
      .status(200)
      .json({ success: true, data: await getLeetCodeSyncStatus(req.user!.id) });
  } catch (err) {
    console.error("Get LeetCode sync status error:", errorDetails(err));
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}

export async function refreshOwnLeetCode(req: Request, res: Response) {
  try {
    const result = await refreshOwnLeetCodeStats(req.user!.id);
    if (!result.refreshed)
      return res.status(429).json({ success: false, error: result.error });
    return res.status(200).json({
      success: true,
      data: { platform: "leetcode", synced: true, stats: result.stats },
    });
  } catch (err) {
    console.error("LeetCode refresh error:", errorDetails(err));
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}

export async function triggerResyncAllLeetCode(req: Request, res: Response) {
  res.status(202).json({ success: true, message: "LeetCode resync started" });
  refreshAllVerifiedLeetCodeUsers()
    .then((result) =>
      console.log(
        `LeetCode resync complete: ${result.succeeded}/${result.total} succeeded`,
      ),
    )
    .catch((err) => console.error("LeetCode resync job failed:", err));
}

export async function requestCodeChefSync(req: Request, res: Response) {
  try {
    const handle = req.body?.handle;
    if (!handle || typeof handle !== "string" || !handle.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "CodeChef handle is required" });
    }
    const result = await requestCodeChefVerification(
      req.user!.id,
      handle.trim(),
    );
    return res
      .status(200)
      .json({
        success: true,
        data: {
          ...result,
          instructions:
            "Go to CodeChef Edit Profile, replace your Name with this code, save, then click Verify.",
        },
      });
  } catch (err) {
    const error = errorDetails(err);
    console.error("CodeChef request verification error:", error);
    return res
      .status(500)
      .json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
  }
}

export async function verifyCodeChefSync(req: Request, res: Response) {
  try {
    const result = await verifyAndSyncCodeChef(req.user!.id);
    if (!result.verified)
      return res.status(422).json({ success: false, error: result.error });
    return res
      .status(200)
      .json({
        success: true,
        data: { platform: "codechef", synced: true, stats: result.stats },
      });
  } catch (err) {
    const error = errorDetails(err);
    console.error("CodeChef verify sync error:", error);
    return res
      .status(500)
      .json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
  }
}

export async function getCodeChefStatus(req: Request, res: Response) {
  try {
    return res
      .status(200)
      .json({ success: true, data: await getCodeChefSyncStatus(req.user!.id) });
  } catch (err) {
    console.error("Get CodeChef sync status error:", errorDetails(err));
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}

export async function refreshOwnCodeChef(req: Request, res: Response) {
  try {
    const result = await refreshOwnCodeChefStats(req.user!.id);
    if (!result.refreshed)
      return res.status(429).json({ success: false, error: result.error });
    return res
      .status(200)
      .json({
        success: true,
        data: { platform: "codechef", synced: true, stats: result.stats },
      });
  } catch (err) {
    console.error("CodeChef refresh error:", errorDetails(err));
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}

export async function triggerResyncAllCodeChef(req: Request, res: Response) {
  res.status(202).json({ success: true, message: "CodeChef resync started" });
  refreshAllVerifiedCodeChefUsers()
    .then((result) =>
      console.log(
        `CodeChef resync complete: ${result.succeeded}/${result.total} succeeded`,
      ),
    )
    .catch((err) => console.error("CodeChef resync job failed:", err));
}

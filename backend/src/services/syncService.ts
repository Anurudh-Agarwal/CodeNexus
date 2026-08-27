import { supabase } from "../lib/supabase";
import {
  fetchCodeforcesStats,
  getCodeforcesUserInfo,
} from "./codeforcesService";
import { fetchLeetCodeStats, getLeetCodeAboutMe } from "./leetcodeService";
import { fetchCodeChefStats, getCodeChefDisplayName } from "./codechefService";
import { getVerificationCode } from "./verificationService";

const VERIFICATION_WINDOW_MINUTES = 15;

function getSyncErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const details = error as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };
    return (
      [details.message, details.code, details.details, details.hint]
        .filter(Boolean)
        .join(" | ") || fallback
    );
  }
  return fallback;
}

export async function requestCodeforcesVerification(
  userId: string,
  handle: string,
) {
  const normalizedHandle = handle.trim();
  if (!normalizedHandle) {
    throw new Error("Codeforces handle is required");
  }

  const code = getVerificationCode();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_WINDOW_MINUTES * 60 * 1000,
  ).toISOString();

  const { error } = await supabase.from("codeforces_stats").upsert(
    {
      user_id: userId,
      handle: normalizedHandle,
      handle_verified: false,
      verification_code: code,
      verification_code_expires_at: expiresAt,
      sync_status: "pending",
      sync_error: null,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
  return { code, expiresAt };
}

export async function verifyAndSyncCodeforces(userId: string) {
  const { data: row, error: rowError } = await supabase
    .from("codeforces_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (rowError) throw rowError;
  if (!row || !row.verification_code) {
    return {
      verified: false as const,
      error: "No verification code in progress. Request a code first.",
    };
  }
  if (typeof row.handle !== "string" || !row.handle.trim()) {
    return {
      verified: false as const,
      error:
        "Codeforces handle is missing. Request a new code with your handle.",
    };
  }
  if (parseDatabaseTimestamp(row.verification_code_expires_at) < Date.now()) {
    return {
      verified: false as const,
      error: "Verification code expired. Request a new one",
    };
  }

  const userInfo = getCodeforcesUserInfo(row.handle);

  if (
    ((await userInfo).firstName || "").trim().toUpperCase() !==
    row.verification_code.trim().toUpperCase()
  ) {
    return {
      verified: false as const,
      error: `Could not found in your Codeforces First Name yet.Make sure you saved "${row.verification_code}" exactly, then try again.`,
    };
  }
  try {
    const stats = await fetchCodeforcesStats(row.handle);
    const { data, error } = await supabase
      .from("codeforces_stats")
      .update({
        handle_verified: true,
        verification_code: null,
        verification_code_expires_at: null,
        rating: stats.rating,
        rank: stats.rank,
        total_solved: stats.total_solved,
        monthly_solved: stats.monthly_solved,
        yearly_solved: stats.yearly_solved,
        current_streak: stats.current_streak,
        longest_streak: stats.longest_streak,
        sync_status: "synced",
        sync_error: null,
        last_synced: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return { verified: true as const, stats: data };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Codeforces sync failed after verification";
    console.error(message);
    const { error: updateError } = await supabase
      .from("codeforces_stats")
      .update({ sync_status: "error", sync_error: message })
      .eq("user_id", userId);
    if (updateError) console.error("Could not save sync error:", updateError);
    return { verified: false as const, error: message };
  }
}

export async function refreshCodeforcesStats(userId: string) {
  const { data: row, error } = await supabase
    .from("codeforces_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!row || !row.handle_verified) {
    return { refreshed: false as const, reason: "not_verified" };
  }

  try {
    const stats = await fetchCodeforcesStats(row.handle);
    await supabase
      .from("codeforces_stats")
      .update({
        rating: stats.rating,
        rank: stats.rank,
        total_solved: stats.total_solved,
        monthly_solved: stats.monthly_solved,
        yearly_solved: stats.yearly_solved,
        current_streak: stats.current_streak,
        longest_streak: stats.longest_streak,
        sync_status: "synced",
        sync_error: null,
        last_synced: new Date().toISOString(),
      })
      .eq("user_id", userId);
    return { refreshed: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refresh failed";
    await supabase
      .from("codeforces_stats")
      .update({ sync_status: "error", sync_error: message })
      .eq("user_id", userId);
    return { refreshed: false as const, reason: message };
  }
}

export async function refreshAllVerifiedCodeforcesUsers() {
  const { data: rows, error } = await supabase
    .from("codeforces_stats")
    .select("user_id")
    .eq("handle_verified", true);

  if (error) throw error;
  const results = await Promise.allSettled(
    (rows || []).map((row) => refreshCodeforcesStats(row.user_id)),
  );

  return {
    total: results.length,
    succeeded: results.filter(
      (r) => r.status === "fulfilled" && r.value.refreshed,
    ).length,
  };
}

export async function getCodeforcesSyncStatus(userId: string) {
  const { data, error } = await supabase
    .from("codeforces_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

const REFRESH_COOLDOWN_MINUTES = 5;

function parseDatabaseTimestamp(timestamp: string): number {
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/.test(timestamp)
    ? timestamp
    : `${timestamp.replace(" ", "T")}Z`;
  return new Date(normalized).getTime();
}

export async function refreshOwnCodeforcesStats(userId: string) {
  const { data: row, error } = await supabase
    .from("codeforces_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!row || !row.handle_verified) {
    return {
      refreshed: false as const,
      error: "Connect and verify a Codeforces handle first",
    };
  }

  if (row.last_synced) {
    const minuteSince =
      (Date.now() - parseDatabaseTimestamp(row.last_synced)) / 60000;
    if (minuteSince < REFRESH_COOLDOWN_MINUTES) {
      const wait = Math.ceil(REFRESH_COOLDOWN_MINUTES - minuteSince);
      return {
        refreshed: false as const,
        error: `You can refresh again in ${wait} minute${wait === 1 ? "" : "s"}.`,
      };
    }
  }

  const result = await refreshCodeforcesStats(userId);
  if (!result.refreshed) {
    return {
      refreshed: false as const,
      error: "reason" in result ? String(result.reason) : "Refresh failed",
    };
  }

  const { data: updated } = await supabase
    .from("codeforces_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return { refreshed: true as const, stats: updated };
}

export async function requestLeetCodeVerification(
  userId: string,
  handle: string,
) {
  const normalizedHandle = handle.trim();
  if (!normalizedHandle) throw new Error("LeetCode username is required");
  const code = getVerificationCode();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_WINDOW_MINUTES * 60000,
  ).toISOString();
  const { error } = await supabase.from("leetcode_stats").upsert(
    {
      user_id: userId,
      handle: normalizedHandle,
      handle_verified: false,
      verification_code: code,
      verification_code_expires_at: expiresAt,
      sync_status: "pending",
      sync_error: null,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
  return { code, expiresAt };
}

export async function verifyAndSyncLeetCode(userId: string) {
  const { data: row, error } = await supabase
    .from("leetcode_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!row || !row.verification_code)
    return {
      verified: false as const,
      error: "No verification code in progress. Request a code first.",
    };
  if (!row.handle?.trim())
    return {
      verified: false as const,
      error: "LeetCode username is missing. Request a new code.",
    };
  if (parseDatabaseTimestamp(row.verification_code_expires_at) < Date.now())
    return {
      verified: false as const,
      error: "Verification code expired. Request a new one.",
    };

  try {
    const aboutMe = await getLeetCodeAboutMe(row.handle);
    if (
      aboutMe.trim().toUpperCase() !==
      row.verification_code.trim().toUpperCase()
    ) {
      return {
        verified: false as const,
        error: `Could not find the code in your LeetCode Summary. Save "${row.verification_code}" exactly, then try again.`,
      };
    }
    const stats = await fetchLeetCodeStats(row.handle);
    const { data, error: updateError } = await supabase
      .from("leetcode_stats")
      .update({
        handle_verified: true,
        verification_code: null,
        verification_code_expires_at: null,
        ...stats,
        sync_status: "synced",
        sync_error: null,
        last_synced: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .maybeSingle();
    if (updateError) throw updateError;
    return { verified: true as const, stats: data };
  } catch (err) {
    const message = getSyncErrorMessage(
      err,
      "LeetCode sync failed after verification",
    );
    console.error("LeetCode verification error:", err);
    await supabase
      .from("leetcode_stats")
      .update({ sync_status: "error", sync_error: message })
      .eq("user_id", userId);
    return { verified: false as const, error: message };
  }
}

export async function getLeetCodeSyncStatus(userId: string) {
  const { data, error } = await supabase
    .from("leetcode_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function refreshLeetCodeStats(userId: string) {
  const { data: row, error } = await supabase
    .from("leetcode_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!row || !row.handle_verified)
    return { refreshed: false as const, reason: "not_verified" };
  try {
    const stats = await fetchLeetCodeStats(row.handle);
    const { error: updateError } = await supabase
      .from("leetcode_stats")
      .update({
        ...stats,
        sync_status: "synced",
        sync_error: null,
        last_synced: new Date().toISOString(),
      })
      .eq("user_id", userId);
    if (updateError) throw updateError;
    return { refreshed: true as const };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "LeetCode refresh failed";
    console.error("LeetCode refresh error:", err);
    await supabase
      .from("leetcode_stats")
      .update({ sync_status: "error", sync_error: message })
      .eq("user_id", userId);
    return { refreshed: false as const, reason: message };
  }
}

export async function refreshOwnLeetCodeStats(userId: string) {
  const { data: row, error } = await supabase
    .from("leetcode_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!row || !row.handle_verified)
    return {
      refreshed: false as const,
      error: "Connect and verify a LeetCode username first",
    };
  if (row.last_synced) {
    const minuteSince =
      (Date.now() - parseDatabaseTimestamp(row.last_synced)) / 60000;
    if (minuteSince < REFRESH_COOLDOWN_MINUTES) {
      const wait = Math.ceil(REFRESH_COOLDOWN_MINUTES - minuteSince);
      return {
        refreshed: false as const,
        error: `You can refresh again in ${wait} minute${wait === 1 ? "" : "s"}.`,
      };
    }
  }
  const result = await refreshLeetCodeStats(userId);
  if (!result.refreshed)
    return {
      refreshed: false as const,
      error: "reason" in result ? String(result.reason) : "Refresh failed",
    };
  const { data: updated } = await supabase
    .from("leetcode_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return { refreshed: true as const, stats: updated };
}

export async function refreshAllVerifiedLeetCodeUsers() {
  const { data: rows, error } = await supabase
    .from("leetcode_stats")
    .select("user_id")
    .eq("handle_verified", true);
  if (error) throw error;
  const results = await Promise.allSettled(
    (rows || []).map((row) => refreshLeetCodeStats(row.user_id)),
  );
  return {
    total: results.length,
    succeeded: results.filter(
      (result) => result.status === "fulfilled" && result.value.refreshed,
    ).length,
  };
}

export async function requestCodeChefVerification(
  userId: string,
  handle: string,
) {
  const normalizedHandle = handle.trim();
  if (!normalizedHandle) throw new Error("CodeChef handle is required");
  const code = getVerificationCode();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_WINDOW_MINUTES * 60000,
  ).toISOString();
  const { error } = await supabase.from("codechef_stats").upsert(
    {
      user_id: userId,
      handle: normalizedHandle,
      handle_verified: false,
      verification_code: code,
      verification_code_expires_at: expiresAt,
      sync_status: "pending",
      sync_error: null,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
  return { code, expiresAt };
}

export async function verifyAndSyncCodeChef(userId: string) {
  const { data: row, error } = await supabase
    .from("codechef_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!row || !row.verification_code)
    return {
      verified: false as const,
      error: "No verification code in progress. Request a code first.",
    };
  if (!row.handle?.trim())
    return {
      verified: false as const,
      error: "CodeChef handle is missing. Request a new code.",
    };
  if (parseDatabaseTimestamp(row.verification_code_expires_at) < Date.now())
    return {
      verified: false as const,
      error: "Verification code expired. Request a new one.",
    };

  try {
    const displayName = await getCodeChefDisplayName(row.handle);
    if (
      !displayName
        .toUpperCase()
        .includes(row.verification_code.trim().toUpperCase())
    ) {
      return {
        verified: false as const,
        error: `Could not find the code in your CodeChef Name. Save "${row.verification_code}" exactly, then try again.`,
      };
    }
    const stats = await fetchCodeChefStats(row.handle);
    const { data, error: updateError } = await supabase
      .from("codechef_stats")
      .update({
        handle_verified: true,
        verification_code: null,
        verification_code_expires_at: null,
        ...stats,
        sync_status: "synced",
        sync_error: null,
        last_synced: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .maybeSingle();
    if (updateError) throw updateError;
    return { verified: true as const, stats: data };
  } catch (err) {
    const message = getSyncErrorMessage(
      err,
      "CodeChef sync failed after verification",
    );
    console.error("CodeChef verification error:", err);
    await supabase
      .from("codechef_stats")
      .update({ sync_status: "error", sync_error: message })
      .eq("user_id", userId);
    return { verified: false as const, error: message };
  }
}

export async function getCodeChefSyncStatus(userId: string) {
  const { data, error } = await supabase
    .from("codechef_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function refreshCodeChefStats(userId: string) {
  const { data: row, error } = await supabase
    .from("codechef_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!row || !row.handle_verified)
    return { refreshed: false as const, reason: "not_verified" };
  try {
    const stats = await fetchCodeChefStats(row.handle);
    const { error: updateError } = await supabase
      .from("codechef_stats")
      .update({
        ...stats,
        sync_status: "synced",
        sync_error: null,
        last_synced: new Date().toISOString(),
      })
      .eq("user_id", userId);
    if (updateError) throw updateError;
    return { refreshed: true as const };
  } catch (err) {
    const message = getSyncErrorMessage(err, "CodeChef refresh failed");
    console.error("CodeChef refresh error:", err);
    await supabase
      .from("codechef_stats")
      .update({ sync_status: "error", sync_error: message })
      .eq("user_id", userId);
    return { refreshed: false as const, reason: message };
  }
}

export async function refreshOwnCodeChefStats(userId: string) {
  const { data: row, error } = await supabase
    .from("codechef_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!row || !row.handle_verified)
    return {
      refreshed: false as const,
      error: "Connect and verify a CodeChef handle first",
    };
  if (row.last_synced) {
    const minuteSince =
      (Date.now() - parseDatabaseTimestamp(row.last_synced)) / 60000;
    if (minuteSince < REFRESH_COOLDOWN_MINUTES) {
      const wait = Math.ceil(REFRESH_COOLDOWN_MINUTES - minuteSince);
      return {
        refreshed: false as const,
        error: `You can refresh again in ${wait} minute${wait === 1 ? "" : "s"}.`,
      };
    }
  }
  const result = await refreshCodeChefStats(userId);
  if (!result.refreshed)
    return {
      refreshed: false as const,
      error: "reason" in result ? String(result.reason) : "Refresh failed",
    };
  const { data: updated } = await supabase
    .from("codechef_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return { refreshed: true as const, stats: updated };
}

export async function refreshAllVerifiedCodeChefUsers() {
  const { data: rows, error } = await supabase
    .from("codechef_stats")
    .select("user_id")
    .eq("handle_verified", true);
  if (error) throw error;
  const results = await Promise.allSettled(
    (rows || []).map((row) => refreshCodeChefStats(row.user_id)),
  );
  return {
    total: results.length,
    succeeded: results.filter(
      (result) => result.status === "fulfilled" && result.value.refreshed,
    ).length,
  };
}

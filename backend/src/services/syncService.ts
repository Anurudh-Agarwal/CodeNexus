import { supabase } from "../lib/supabase";
import {
  fetchCodeforcesStats,
  getCodeforcesUserInfo,
} from "./codeforcesService";
import { getVerificationCode } from "./verificationService";

const VERIFICATION_WINDOW_MINUTES = 15;

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
  if (new Date(row.verification_code_expires_at) < new Date()) {
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

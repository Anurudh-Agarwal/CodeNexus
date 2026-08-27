"use client";

import { useState } from "react";
import { Check, AlertCircle, Copy, RefreshCw } from "lucide-react";
import { useSyncCodeforces } from "@/hooks/useSyncCodeforces";
import { Button } from "@/components/ui/button";

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const timestamp = /(?:Z|[+-]\d{2}:?\d{2})$/.test(iso)
    ? iso
    : `${iso.replace(" ", "T")}Z`;
  const mins = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SyncPlatformsPage() {
  const [handle, setHandle] = useState("");
  const { step, code, loading, error, status, requestCode, verify, refresh } =
    useSyncCodeforces();

  async function handleRequestCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!handle.trim()) return;
    await requestCode(handle.trim());
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Sync Platforms</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Connect your competitive programming accounts to appear on the
        leaderboard.
      </p>

      <section className="border border-border rounded-xl p-4 mb-4">
        <h2 className="text-sm font-semibold mb-3">Codeforces</h2>

        {step === "loading" && (
          <p className="text-sm text-muted-foreground">
            Checking connection...
          </p>
        )}

        {step === "idle" && (
          <form onSubmit={handleRequestCode} className="flex gap-2">
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Your Codeforces handle"
              className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" disabled={loading || !handle.trim()}>
              {loading ? "Loading..." : "Continue"}
            </Button>
          </form>
        )}

        {(step === "awaiting_verification" || step === "verifying") && code && (
          <div className="space-y-3">
            <p className="text-sm">
              1. Go to{" "}
              <a
                href="https://codeforces.com/settings/social"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Codeforces → Settings → Social
              </a>
            </p>
            <p className="text-sm">
              2. Paste this code as your <strong>First Name</strong>, then save:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-center text-lg tracking-widest font-mono bg-muted rounded-lg py-2">
                {code}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => navigator.clipboard.writeText(code)}
              >
                <Copy size={16} />
              </Button>
            </div>
            <p className="text-sm">3. Come back here and click Verify.</p>
            <Button onClick={verify} disabled={loading} className="w-full">
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        )}

        {step === "synced" && status && (
          <div>
            <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
              <Check size={16} /> Connected as <strong>{status.handle}</strong>
            </div>
            <div className="flex items-center gap-5 text-sm mb-3">
              <span>
                <strong>{status.total_solved ?? "—"}</strong>{" "}
                <span className="text-muted-foreground">solved</span>
              </span>
              <span>
                <strong>{status.rating ?? "—"}</strong>{" "}
                <span className="text-muted-foreground">rating</span>
              </span>
              <span className="text-muted-foreground text-xs">
                Synced {timeAgo(status.last_synced)}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {loading ? "Refreshing..." : "Refresh now"}
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </section>

      {(["LeetCode", "CodeChef"] as const).map((platform) => (
        <section
          key={platform}
          className="border border-border rounded-xl p-4 mb-4 opacity-60"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{platform}</h2>
            <span className="text-[10px] font-medium text-muted-foreground border border-border rounded-full px-2 py-0.5">
              Coming soon
            </span>
          </div>
        </section>
      ))}
    </div>
  );
}

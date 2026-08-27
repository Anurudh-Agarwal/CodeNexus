"use client";

import { AlertCircle, Check, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type SyncState = {
  step: "loading" | "idle" | "awaiting_verification" | "verifying" | "synced";
  code: string | null;
  loading: boolean;
  error: string | null;
  status: {
    handle: string;
    total_solved: number | null;
    rating: number | null;
    last_synced: string | null;
  } | null;
  requestCode: (handle: string) => Promise<void>;
  verify: () => Promise<void>;
  refresh: () => Promise<void>;
};

type PlatformSyncCardProps = {
  platform: string;
  verificationInstructions: string;
  summaryLabel: string;
  sync: SyncState;
  timeAgo: (iso: string | null) => string;
};

export function PlatformSyncCard({
  platform,
  verificationInstructions,
  summaryLabel,
  sync,
  timeAgo,
}: PlatformSyncCardProps) {
  const { step, code, loading, error, status, requestCode, verify, refresh } =
    sync;
  const handleRequestCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("handle") as HTMLInputElement;
    if (input.value.trim()) await requestCode(input.value.trim());
  };

  return (
    <section className="border border-border rounded-xl p-4 mb-4">
      <h2 className="text-sm font-semibold mb-3">{platform}</h2>
      {step === "loading" && (
        <p className="text-sm text-muted-foreground">Checking connection...</p>
      )}
      {step === "idle" && (
        <form onSubmit={handleRequestCode} className="flex gap-2">
          <input
            name="handle"
            type="text"
            placeholder={`${platform} username`}
            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Continue"}
          </Button>
        </form>
      )}
      {(step === "awaiting_verification" || step === "verifying") && code && (
        <div className="space-y-3">
          <p className="text-sm">1. {verificationInstructions}</p>
          <p className="text-sm">
            2. Paste this code as your <strong>{summaryLabel}</strong>, then
            save:
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
              aria-label="Copy verification code"
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
  );
}

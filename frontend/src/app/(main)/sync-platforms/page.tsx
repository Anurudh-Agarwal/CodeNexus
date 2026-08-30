"use client";

import { useSyncCodeforces } from "@/hooks/useSyncCodeforces";
import { useSyncLeetCode } from "@/hooks/useSyncLeetCode";
import { useSyncCodeChef } from "@/hooks/useSyncCodeChef";
import { PlatformSyncCard } from "@/components/PlatformSyncCard";

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
  const codeforcesSync = useSyncCodeforces();
  const leetCodeSync = useSyncLeetCode();
  const codeChefSync = useSyncCodeChef();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Sync Platforms</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Connect your competitive programming accounts to appear on the
        leaderboard.
      </p>

      <PlatformSyncCard
        platform="Codeforces"
        verificationInstructions="Go to Codeforces → Settings → Social."
        summaryLabel="First Name"
        sync={codeforcesSync}
        timeAgo={timeAgo}
      />
      <PlatformSyncCard
        platform="LeetCode"
        verificationInstructions="Go to LeetCode Profile → Edit Profile → Summary."
        summaryLabel="Summary"
        sync={leetCodeSync}
        timeAgo={timeAgo}
      />
      <PlatformSyncCard
        platform="CodeChef"
        verificationInstructions="Go to CodeChef Edit Profile and replace your public Name."
        summaryLabel="Name"
        sync={codeChefSync}
        timeAgo={timeAgo}
      />
    </div>
  );
}

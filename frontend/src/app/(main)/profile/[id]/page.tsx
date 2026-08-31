"use client";

import { useParams } from "next/navigation";
import { Flame, Trophy, Hash, Link2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { PlatformRating } from "@/types";
import { useFollow } from "@/hooks/useFollow";

const PLATFORM_LABEL: Record<PlatformRating["platform"], string> = {
  codeforces: "Codeforces",
  leetcode: "LeetCode",
  codechef: "CodeChef",
};

const PLATFORM_ACCENT: Record<PlatformRating["platform"], string> = {
  codeforces: "border-l-blue-500",
  leetcode: "border-l-orange-500",
  codechef: "border-l-amber-700",
};

function formatStat(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : value.toString();
}

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { profile, loading, error, refetch } = useUser(params.id);
  const {
    isFollowing,
    followersCount,
    loading: followingLoading,
    toggle,
  } = useFollow(profile?.is_following, profile?.followers_count, refetch);

  const isOwnProfile = currentUser?.id === params.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
        Loading profile...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-2">
        <p className="text-sm font-medium">Could not load this profile</p>
        <p className="text-xs text-muted-foreground">
          {error || "User not found"}
        </p>
      </div>
    );
  }

  const { user, ratings, following_count } = profile;
  const totalSolved = ratings.reduce(
    (sum, r) => sum + (r.total_solved || 0),
    0,
  );
  const longestStreak = ratings.reduce(
    (max, r) => Math.max(max, r.longest_streak || 0),
    0,
  );

  return (
    <div>
      <div className="flex items-start gap-6 mb-6">
        <Avatar size="lg" className="size-20 md:size-28 shrink-0">
          <AvatarImage src={user.avatar_url} alt={user.name} />
          <AvatarFallback className="text-2xl">
            {user.name?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-xl font-bold truncate">{user.name}</h1>
            {isOwnProfile ? (
              <Link href={`/profile/${user.id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                disabled={followingLoading}
                onClick={() => toggle(user.id)}
              >
                {followingLoading
                  ? "Please wait..."
                  : isFollowing
                    ? "Unfollow"
                    : "Follow"}
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            Year {user.year} · {user.branch}
          </p>

          <div className="flex items-center gap-5 text-sm mb-3">
            <span>
              <strong>{totalSolved}</strong>{" "}
              <span className="text-muted-foreground">solved</span>
            </span>
            <span>
              <strong>{followersCount}</strong>{" "}
              <span className="text-muted-foreground">followers</span>
            </span>
            <span>
              <strong>{following_count}</strong>{" "}
              <span className="text-muted-foreground">following</span>
            </span>
          </div>

          {user.bio && <p className="text-sm">{user.bio}</p>}

          {(user.github_url || user.linkedin_url) && (
            <div className="flex items-center gap-3 mt-2">
              {user.github_url && (
                <a
                  href={user.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Link2 size={12} /> GitHub
                </a>
              )}
              {user.linkedin_url && (
                <a
                  href={user.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Link2 size={12} /> LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 py-4 border-y border-border">
        <div className="text-center">
          <p className="text-lg font-bold">{totalSolved}</p>
          <p className="text-xs text-muted-foreground">Total Solved</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-lg font-bold flex items-center justify-center gap-1">
            {longestStreak} <Flame size={16} className="text-orange-500" />
          </p>
          <p className="text-xs text-muted-foreground">Longest Streak</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{ratings.length}</p>
          <p className="text-xs text-muted-foreground">Platforms Linked</p>
        </div>
      </div>

      {ratings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground mb-3">
            {isOwnProfile
              ? "You haven't connected any platforms yet."
              : `${user.name} hasn't connected any platforms yet.`}
          </p>
          {isOwnProfile && (
            <Link href="/sync-platforms">
              <Button size="sm">Connect a platform</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ratings.map((r) => (
            <div
              key={r.platform}
              className={`flex items-center justify-between rounded-xl border border-border border-l-4 ${PLATFORM_ACCENT[r.platform]} px-4 py-3`}
            >
              <div>
                <p className="text-sm font-semibold">
                  {PLATFORM_LABEL[r.platform]}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Hash size={11} /> {r.handle}
                </p>
              </div>
              <div className="flex items-center gap-5 text-sm">
                <div className="text-center">
                  <p className="font-semibold">{formatStat(r.total_solved)}</p>
                  <p className="text-[10px] text-muted-foreground">Solved</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold flex items-center gap-1">
                    <Trophy size={12} className="text-yellow-500" />{" "}
                    {formatStat(r.rating)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Rating</p>
                </div>
                {r.platform !== "codechef" && (
                  <div className="text-center">
                    <p className="font-semibold">
                      {formatStat(r.longest_streak)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Best Streak
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

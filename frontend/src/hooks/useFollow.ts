import { useState } from "react";
import { followUser, unfollowUser } from "@/lib/api";

export function useFollow(
  initialIsFollowing?: boolean,
  initialFollowersCount?: number,
) {
  const [isFollowing, setIsFollowing] = useState(Boolean(initialIsFollowing));

  const [followersCount, setFollowersCount] = useState(
    Number(initialFollowersCount ?? 0),
  );

  const [loading, setLoading] = useState(false);

  async function toggle(userId: string) {
    if (!userId || loading) return;

    setLoading(true);

    const wasFollowing = isFollowing;

    setIsFollowing(!wasFollowing);
    setFollowersCount((count) =>
      wasFollowing ? Math.max(0, count - 1) : count + 1,
    );

    try {
      if (wasFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
    } catch {
      setIsFollowing(wasFollowing);
      setFollowersCount((count) =>
        wasFollowing ? count + 1 : Math.max(0, count - 1),
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    isFollowing,
    followersCount,
    loading,
    toggle,
  };
}
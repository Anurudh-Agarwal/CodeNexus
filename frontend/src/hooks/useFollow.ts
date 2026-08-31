import { useState } from "react";
import { followUser, unfollowUser } from "@/lib/api";

export function useFollow(
  initialIsFollowing?: boolean,
  initialFollowersCount?: number,
  onChange?: () => void | Promise<void>,
) {
  const [pendingFollowing, setPendingFollowing] = useState<boolean | null>(
    null,
  );
  const [pendingFollowersCount, setPendingFollowersCount] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(false);

  const isFollowing = pendingFollowing ?? Boolean(initialIsFollowing);
  const followersCount =
    pendingFollowersCount ?? Number(initialFollowersCount ?? 0);

  async function toggle(userId: string) {
    if (!userId || loading) return;

    setLoading(true);

    const wasFollowing = pendingFollowing ?? Boolean(initialIsFollowing);
    const nextValue = !wasFollowing;

    setPendingFollowing(nextValue);
    setPendingFollowersCount((count) =>
      wasFollowing
        ? Math.max(0, (count ?? Number(initialFollowersCount ?? 0)) - 1)
        : (count ?? Number(initialFollowersCount ?? 0)) + 1,
    );

    try {
      if (wasFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }

      await onChange?.();
      setPendingFollowing(null);
      setPendingFollowersCount(null);
    } catch {
      setPendingFollowing(null);
      setPendingFollowersCount(null);
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

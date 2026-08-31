import { getUser } from "@/lib/api";
import { useEffect, useState } from "react";
import { ProfileResponse } from "@/types";

type ProfileData = NonNullable<ProfileResponse["data"]>;

export const useUser = (userId: string | undefined) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getUser(userId as string);
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.error || "Failed to fetch profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    let isCancelled = false;

    async function fetchUser() {
      try {
        setLoading(true);
        setError(null);
        const response = await getUser(userId as string);
        if (isCancelled) return;
        if (response.success && response.data) {
          setProfile(response.data);
        } else {
          setError(response.error || "Failed to fetch profile");
        }
      } catch (err) {
        if (isCancelled) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchUser();
    return () => {
      isCancelled = true;
    };
  }, [userId]);

  return { profile, loading, error, refetch };
};

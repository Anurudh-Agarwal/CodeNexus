import { useEffect, useState } from "react";
import { getHomeFeed } from "@/lib/api";
import type { RevisionPost } from "@/types/api";

export function useHomeFeed() {
  const [posts, setPosts] = useState<RevisionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      try {
        const response = await getHomeFeed();
        if (isCancelled) return;
        if (response.success && Array.isArray(response.data)) {
          setPosts(response.data);
        } else if (response.success) {
          setPosts([]);
        } else {
          setError(response.error || "Failed to load feed");
        }
      } catch (err) {
        if (!isCancelled)
          setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, []);

  return { posts, loading, error };
}

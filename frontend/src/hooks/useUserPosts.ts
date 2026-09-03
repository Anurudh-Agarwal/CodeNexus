import { getUserPosts } from "@/lib/api";
import { RevisionPost } from "@/types/api";
import { useEffect, useState } from "react";

export function useUserPosts(userId: string | undefined) {
  const [posts, setPosts] = useState<RevisionPost[]>([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState<boolean>(!!userId);

  useEffect(() => {
    if (!userId) return;

    let isCancelled = false;

    const fetchPosts = async () => {
      setLoading(true);

      try {
        const response = await getUserPosts(userId);

        if (isCancelled) return;

        if (response.success && response.data) {
          setPosts(response.data.posts);
          setVisible(response.data.visible);
        } else {
          setPosts([]);
          setVisible(false);
        }
      } catch {
        if (!isCancelled) {
          setPosts([]);
          setVisible(false);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void fetchPosts();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  if (!userId) {
    return {
      posts: [],
      visible: false,
      loading: false,
    };
  }

  return { posts, visible, loading };
}

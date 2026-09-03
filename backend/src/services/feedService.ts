import { supabase } from "../lib/supabase";

const MAX_POSTS_PER_DAY = 15;

export async function createRevisionPost(
  userId: string,
  questionId: string,
  note: string | null,
) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count: todayPosts, error: countError } = await supabase
    .from("revision_posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString());

  if (countError) throw countError;
  if ((todayPosts ?? 0) >= MAX_POSTS_PER_DAY) {
    throw new Error(
      `Daily posting limit reached. You can post at most ${MAX_POSTS_PER_DAY} questions per day.`,
    );
  }

  const { data: existingPost, error: existingError } = await supabase
    .from("revision_posts")
    .select("id")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existingPost) {
    throw new Error("You already shared this question");
  }

  const { data, error } = await supabase
    .from("revision_posts")
    .insert({ user_id: userId, question_id: questionId, note })
    .select("* ,  questions(*), users(name , avatar_url)")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getHomeFeed(viewerId: string) {
  const { data: followingRows, error: followError } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", viewerId);
  if (followError) throw followError;

  const followingIds = (followingRows || []).map((r) => r.following_id);

  const { data: followedUsers, error: userError } =
    followingIds.length > 0
      ? await supabase
          .from("users")
          .select("id, is_private")
          .in("id", followingIds)
      : { data: [], error: null };
  if (userError) throw userError;

  const publicIds = (followedUsers || [])
    .filter((e) => !e.is_private)
    .map((e) => e.id);
  const privateIds = (followedUsers || [])
    .filter((e) => e.is_private)
    .map((e) => e.id);

  let mutualPrivateIds: string[] = [];
  if (privateIds.length > 0) {
    const { data: backFollows, error: backError } = await supabase
      .from("follows")
      .select("follower_id")
      .in("follower_id", privateIds)
      .eq("following_id", viewerId);
    if (backError) throw backError;
    mutualPrivateIds = (backFollows || []).map((e) => e.follower_id);
  }

  const visibleUserIds = Array.from(
    new Set([viewerId, ...mutualPrivateIds, ...publicIds]),
  );
  if (visibleUserIds.length === 0) return [];

  const { data: posts, error: postError } = await supabase
    .from("revision_posts")
    .select("*, questions(*), users(id, name, avatar_url)")
    .in("user_id", visibleUserIds)
    .order("created_at", { ascending: false })
    .limit(30);

  if (postError) throw postError;
  return posts ?? [];
}

export async function getUserRevisionPosts(profileUserId: string) {
  const { data, error } = await supabase
    .from("revision_posts")
    .select("*, questions(*), users(id, name, avatar_url)")
    .eq("user_id", profileUserId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

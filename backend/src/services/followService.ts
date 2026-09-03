import { supabase } from "../lib/supabase";

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error("You can't follow yourself");
  }

  const { data: existing, error: checkError } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  if (checkError) throw checkError;
  if (existing) return;

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: followerId, following_id: followingId });

  if (error) throw error;
}

export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  if (error) throw error;
}

export async function getFollowStatus(
  viewerId: string | null,
  profileUserId: string,
) {
  const [followersResult, followingResult, isFollowingResult] =
    await Promise.all([
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", profileUserId),
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", profileUserId),
      viewerId
        ? supabase
            .from("follows")
            .select("id")
            .eq("follower_id", viewerId)
            .eq("following_id", profileUserId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  return {
    followers_count: followersResult.count ?? 0,
    following_count: followingResult.count ?? 0,
    is_following: !!isFollowingResult.data,
  };
}

export async function canViewPosts(viewerId: string | null , profileUserId: string):Promise<boolean>{
  if(!viewerId) return false;
  if(viewerId===profileUserId) return true;

  const {data: profileUser}= await supabase.from('users').select('is_private').eq('id', profileUserId ).maybeSingle()
  
  if(!profileUser) return false
  if(!profileUser.is_private) return true

  const { data: isFollowBack }= await supabase.from('follows').select('id').eq('following_id', viewerId).eq('follower_id', profileUserId).maybeSingle()
  
  return !!isFollowBack
}
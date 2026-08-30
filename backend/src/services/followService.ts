import { supabase } from "../lib/supabase";

export async function followUser(followerId: string, followingId: string){
    if(followerId===followingId){
        throw new Error ("You can't follow yourself")
    }
    const {error}= await supabase
        .from("follows")
        .insert({follower_id: followerId, following_id: followingId})
    if (error) throw error
}

export async function unfollowUser(followerId: string , followingId: string){
    const {error}= await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId)   
    
    if(error) throw error
}

export async function getFollowStatus(viewerId: string | null, profileUserId: string){
    const [followersResult, followingResult , isFollowingResult]=await Promise.all([
        supabase.from('followers').select('id', {count: 'exact', head: true}).eq('following_id', profileUserId),
        supabase.from('followers').select('id', {count: 'exact', head: true}).eq('follower_id', profileUserId),
        viewerId
            ?supabase.from('followers').select('id').eq('follower_id', viewerId).eq('following_id', profileUserId).maybeSingle()
            :Promise.resolve({data:null}),
    ])

    return {
        followers_count : followersResult.count ?? 0 ,
        following_count: followingResult.count ?? 0,
        is_following: !!isFollowingResult.data
    }
}

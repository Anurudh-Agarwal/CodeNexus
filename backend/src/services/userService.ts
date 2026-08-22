import { platform } from "node:os";
import { supabase } from "../lib/supabase";

interface ProfileResult{
    user: any 
    ratings: any[]
    followers_count: number
    following_count: number
    is_following: boolean
    recent_activity: any[]
}

export async function fetchUserProfile(userId: string): Promise<ProfileResult| null>{
    const {data: user, error: userError }=await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()  
    
    if(userError){
        console.error('Database error fetching user:', userError)
        throw userError
    }

    if(!user){
        return null
    }

    const [cfResult , lcResult, ccResult]= await Promise.all([
        supabase.from('codeforces_stats').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('leetcode_stats').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('codechef_stats').select('*').eq('user_id', userId).maybeSingle(),
    ])

    if(cfResult.error) throw cfResult.error
    if(lcResult.error) throw lcResult.error
    if(ccResult.error) throw ccResult.error

    const ratings=[
        cfResult.data && { ...cfResult.data, platform : 'codeforces'},
        lcResult.data && { ...lcResult.data, platform:'leetcode'},
        ccResult.data && { ...ccResult.data, platform: 'codechef'}
    ].filter(Boolean)

    return {
        user,
        ratings,
        followers_count:0,
        following_count:0,
        is_following:false,
        recent_activity: [],
    }
}
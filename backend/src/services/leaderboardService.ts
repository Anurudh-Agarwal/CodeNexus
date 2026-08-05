import { mockLeaderboardData } from "../data/Leaderboard";

interface LeaderboardFilters{
    year?:number,
    branch?: string
}
export async function getleaderboardData(filters:LeaderboardFilters){
    await new Promise(resolve=>setTimeout(resolve, 100))
    let data = mockLeaderboardData
    
    if(filters.year){
        data=data.filter(user=> user.year===filters.year)
    }

    if(filters.branch){
        data=data.filter(user=> user.branch===filters.branch)
    }
    data.sort((a,b)=>a.college_rank-b.college_rank)
    return data;
}
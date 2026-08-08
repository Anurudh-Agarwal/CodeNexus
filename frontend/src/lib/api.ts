import { LeaderboardResponse } from "@/types"

const API_BASE_URL = process.env.BACKEND || 'https://codenexus-lg9o.onrender.com/'

const apiCall=async<T>(
    endpoint:string
): Promise<T>=>{
    try{
        const response =await fetch(`${API_BASE_URL}${endpoint}`)
        if(!response.ok){
             throw new Error(`API error: ${response.status}`)
        }
        const data=await(response.json())
        return data
    }catch(error){
        console.error('API call failed:', error)
        throw error
    }
}

export const getLeaderboard=async(filters?:{
    year?:number, 
    branch?: string
}): Promise<LeaderboardResponse>=>{
    const params=new URLSearchParams()
    if(filters?.year) params.append('year', filters.year.toString());
    if(filters?.branch) params.append('branch', filters.branch);
    const queryString=params.toString()
    const endpoint= `api/leaderboard${queryString?`?${queryString}`:''}`
    return apiCall<LeaderboardResponse>(endpoint)
}
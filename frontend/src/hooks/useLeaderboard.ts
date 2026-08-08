import { getLeaderboard } from "@/lib/api";
import { useEffect, useState } from "react";
import { LeaderboardResponse } from "@/types";

interface LeaderboardFilters {
  year?: number
  branch?: string
}

export const useLeaderboard=(filters?:LeaderboardFilters)=>{
    const [entries, setEntries]=useState<NonNullable<LeaderboardResponse['data']>['entries']>([])
    const [loading , setLoading ]=useState(true)
    const [error, setError]=useState<string|null>(null);

    useEffect(()=>{
        async function fetch(){
            try{
                setLoading(true)
                setError(null)
                const response:LeaderboardResponse=await getLeaderboard(filters)
                if( response.success && response.data ){
                    setEntries(response.data.entries)
                }else{
                    setError(response.error || 'Failed to fetch leaderboard')
                }
            }catch(error){
                setError(error instanceof Error ? error.message : 'Unknown error')
            }finally{
                setLoading(false)
            }
        }
        fetch()
    },[filters])
    return { entries, loading, error }
}
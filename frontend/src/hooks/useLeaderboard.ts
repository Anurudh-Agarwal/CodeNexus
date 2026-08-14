import { getLeaderboard } from "@/lib/api"
import { useEffect, useState } from "react"
import type { LeaderboardEntry, LeaderboardFilters, LeaderboardResponse } from "@/types"

export const useLeaderboard = (filters?: LeaderboardFilters) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function fetchLeaderboard() {
      try {
        setLoading(true)
        setError(null)

        const response: LeaderboardResponse = await getLeaderboard(filters)

        if (isCancelled) return

        if (response.success && response.data) {
          setEntries(response.data.entries)
        } else {
          setError(response.error || 'Failed to fetch leaderboard')
        }
      } catch (err) {
        if (isCancelled) return
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    fetchLeaderboard()

    return () => {
      isCancelled = true
    }
  }, [filters?.year, filters?.branch, filters?.platform])

  return { entries, loading, error }
}
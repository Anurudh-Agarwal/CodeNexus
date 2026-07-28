/**
 * Stores a user's competitive programming statistics.
 */
interface CPRating {
  id: string
  user_id: string

  platform: "codeforces" | "leetcode" | "codechef"
  handle: string      // Username on the selected platform

  total_solved: number
  monthly_solved: number
  yearly_solved: number
  current_rating: number
  rank: number
  longest_streak: number
  current_streak: number

  sync_status: "syncing" | "synced" | "error"
  sync_error?: string 

  last_synced: string 
  created_at: string 
  updated_at: string 
}

export type { CPRating }
/**
 * Competitive Programming Ratings
 */

export interface CPRating {
  id: string
  user_id: string
  platform: 'codeforces' | 'leetcode' | 'codechef'
  handle: string
  rating?: number
  rank?: string
  total_solved?: number
  monthly_solved?: number
  yearly_solved?: number
  current_streak?: number
  longest_streak?: number
  sync_status: 'pending' | 'synced' | 'error'
  sync_error?: string
  last_synced?: string
  created_at: string
  updated_at: string
}

export interface CodeforcesRating extends CPRating {
  platform: 'codeforces'
}

export interface LeetcodeRating extends CPRating {
  platform: 'leetcode'
}

export interface CodechefRating extends CPRating {
  platform: 'codechef'
}

export type PlatformRating = CodeforcesRating | LeetcodeRating | CodechefRating

export interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  year: number
  branch: string
  cf_solved: number | null        // NULL if not connected
  cc_solved: number | null        // NULL if not connected
  lc_solved: number | null        // NULL if not connected
  total_solved: number            // Real number (sum of non-null)
}
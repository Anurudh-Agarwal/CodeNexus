/**
 * Represents an action performed by a user on CodeNexus.
 */
type ActionType =
  | "rating_change"
  | "contest_participated"
  | "rank_change"
  | "problem_solved"

interface Activity {
  id: string
  user_id: string

  action: ActionType
  platform: "codeforces" | "leetcode" | "codechef"

  old_rating?: number
  new_rating?: number

  problem_title?: string
  problem_url?: string

  contest_name?: string
  contest_url?: string

  old_rank?: number
  new_rank?: number

  timestamp: string
}

export type { Activity }
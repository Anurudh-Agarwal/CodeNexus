/**
 * User domain types
 */

export default interface User {
  id: string
  email: string
  name: string
  year: number
  branch: 'CSE-R' | 'CSE-AI' | 'CSE-SF' | 'ECE' | 'EE' | 'ME' | 'CE' | 'CHE'
  avatar_url?: string
  bio?: string
  github_url?: string
  linkedin_url?: string
  profile_views: number
  account_verified: boolean
  account_banned: boolean
  created_at: string
  updated_at: string
}

export interface UserStats {
  total_problems_solved: number
  longest_streak: number
  platforms_connected: number
  leaderboard_rank?: number
}

export interface UserProfile {
  user: User
  stats: UserStats
  followers_count: number
  following_count: number
  is_following: boolean
}
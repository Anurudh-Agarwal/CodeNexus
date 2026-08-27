/**
 * API Response types
 */

import type User from './user'
import type { CPRating, LeaderboardEntry } from './ratings'
import type { Message } from './messages'
import type { Activity, Notification } from './activity'

// ============================================================================
// GENERIC API RESPONSE
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// ============================================================================
// LEADERBOARD
// ============================================================================

export type LeaderboardResponse = ApiResponse<{
  entries: LeaderboardEntry[]
  total_users: number
  filtered_by: {
    year: string | number
    branch: string | number
    platform: string
  }
  sorted_by: string
  page?: number
  page_size?: number
}>

// ============================================================================
// PROFILE
// ============================================================================

export type ProfileResponse = ApiResponse<{
  user: User
  ratings: CPRating[]
  followers_count: number
  following_count: number
  is_following: boolean
  recent_activity: Activity[]
}>

// ============================================================================
// MESSAGES
// ============================================================================

export type MessageResponse = ApiResponse<{
  message: Message
}>

export type ChatListResponse = ApiResponse<{
  conversations: Array<{
    id: string
    user_id: string
    name: string
    avatar_url?: string
    last_message: string
    last_message_at: string
    unread_count: number
  }>
  total_count: number
}>

export type ChatMessagesResponse = ApiResponse<{
  messages: Message[]
  user: User
  total_count: number
  page: number
}>

// ============================================================================
// SYNC STATUS
// ============================================================================

export type SyncStatusResponse = ApiResponse<{
  synced_platforms: Array<{
    platform: 'codeforces' | 'leetcode' | 'codechef'
    synced: boolean
    handle?: string
    last_synced?: string
    sync_error?: string
  }>
}>

// ============================================================================
// CODEFORCES SYNC
// ============================================================================

// The shape of a single row from the codeforces_stats table -- this is
// the ONE canonical definition. The /status, /verify, and /refresh
// endpoints all return data queried from this same table, so they all
// reuse this type instead of three near-duplicate shapes that would
// quietly drift apart over time.
export interface CodeforcesSyncStatus {
  handle: string
  handle_verified: boolean
  sync_status: 'pending' | 'synced' | 'error'
  sync_error: string | null
  last_synced: string | null
  rating: number | null
  rank: string | null
  total_solved: number | null
  monthly_solved: number | null
  yearly_solved: number | null
  current_streak: number | null
  longest_streak: number | null
}

export type CodeforcesSyncStatusResponse = ApiResponse<CodeforcesSyncStatus | null>

export type RequestVerificationResponse = ApiResponse<{
  code: string
  expiresAt: string
  instructions: string
}>

export type SyncCodeforcesResponse = ApiResponse<{
  platform: 'codeforces'
  synced: boolean
  stats: CodeforcesSyncStatus
}>

// ============================================================================
// FOLLOW
// ============================================================================

export type FollowResponse = ApiResponse<{
  is_following: boolean
  followers_count: number
}>

// ============================================================================
// AUTH
// ============================================================================

export interface SignupRequest {
  email: string
  password: string
  name: string
  year: number
  branch: string
}

export interface LoginRequest {
  email: string
  password: string
}

export type LoginResponse = ApiResponse<{
  user: User
  token: string
  expires_in: number
}>

export type SignupResponse = ApiResponse<{
  user: User
  token: string
  expires_in: number
}>

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export type NotificationsResponse = ApiResponse<{
  notifications: Notification[]
  unread_count: number
}>

// ============================================================================
// ERROR
// ============================================================================

export type ErrorResponse = ApiResponse<null> & {
  success: false
  error: string
}

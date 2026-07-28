import type User from "./user"
import type { CPRating } from "./ratings"
import type { Activity } from "./activity"
import type { Message } from "./messages"


/**
 * Generic API response wrapper.
 */

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// GET /api/leaderboard
type LeaderboardResponse = ApiResponse<{
  entries: Array<{
    id: string
    name: string
    cf_rating: number
    lc_rating: number
    cc_rating: number
    college_rank: number
    is_following: boolean
  }>
  total_users: number
  page: number
  page_size: number
}>

// GET /api/profile/:id
type ProfileResponse = ApiResponse<{
  user: User
  ratings: CPRating[]
  followers_count: number
  following_count: number
  is_following: boolean
  recent_activity: Activity[]
}>

// POST /api/messages
type MessageResponse = ApiResponse<Message>

// GET /api/sync-status
type SyncStatusResponse = ApiResponse<{
  codeforces: {
    synced: boolean
    handle?: string
    last_synced?: string
  }
  leetcode: {
    synced: boolean
    handle?: string
    last_synced?: string
  }
  codechef: {
    synced: boolean
    handle?: string
    last_synced?: string
  }
}>

// GET /api/chat
type ChatListResponse = ApiResponse<{
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

// GET /api/chat/:userId
type ChatMessagesResponse = ApiResponse<{
  messages: Message[]
  user: User
  total_count: number
  page: number
}>

// POST /api/follow/:userId
type FollowResponse = ApiResponse<{
  is_following: boolean
  followers_count: number
}>

// POST /api/auth/login
type LoginResponse = ApiResponse<{
  user: User
  token: string // JWT token
  expires_in: number // Seconds
}>

// GET /api/notifications
type NotificationsResponse = ApiResponse<{
  notifications: Array<{
    id: string
    type: "message" | "follower" | "contest"
    title: string
    description: string
    is_read: boolean
    created_at: string
  }>
  unread_count: number
}>

// Error response
interface ErrorResponse extends ApiResponse<null> {
  success: false
  error: string
}

export type {
  ApiResponse,
  LeaderboardResponse,
  ProfileResponse,
  MessageResponse,
  SyncStatusResponse,
  ChatListResponse,
  ChatMessagesResponse,
  FollowResponse,
  LoginResponse,
  NotificationsResponse,
  ErrorResponse
}
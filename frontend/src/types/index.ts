// Central export point for all types

import type UserType from "./user";

export type { default as User } from "./user";
export type { UserStats, UserProfile } from "./user";

export type {
  CPRating,
  CodeforcesRating,
  LeetcodeRating,
  CodechefRating,
  PlatformRating,
  LeaderboardEntry,
} from "./ratings";

export type { Message, Conversation, Chat } from "./messages";

export type {
  ActivityType,
  Activity,
  NotificationType,
  Notification,
} from "./activity";

export type {
  ApiResponse,
  LeaderboardResponse,
  ProfileResponse,
  MessageResponse,
  ChatListResponse,
  ChatMessagesResponse,
  SyncStatusResponse,
  CodeforcesSyncStatusResponse,
  CodeforcesSyncStatus,
  LeetCodeSyncStatusResponse,
  LeetCodeSyncStatus,
  SyncLeetCodeResponse,
  FollowResponse,
  LoginResponse,
  SignupResponse,
  LoginRequest,
  SignupRequest,
  NotificationsResponse,
  ErrorResponse,
  CodeChefSyncStatus,
  CodeChefSyncStatusResponse,
  SyncCodeChefResponse,
  FeedResponse,
  QuestionSearchResponse,
  CreatePostResponse, 
  UserPostsResponse
} from "./api";

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Platform = "codeforces" | "leetcode" | "codechef";
export type Branch =
  | "CSE-R"
  | "CSE-AI"
  | "CSE-SF"
  | "ECE"
  | "EE"
  | "ME"
  | "CE"
  | "CHE";
export type Year = 1 | 2 | 3 | 4;

export interface LeaderboardFilters {
  year?: number;
  branch?: string;
  platform?: string;
}

export interface AuthState {
  user: UserType | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

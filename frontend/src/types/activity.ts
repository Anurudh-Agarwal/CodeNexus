/**
 * User activity and notifications
 */

export type ActivityType = 
  | 'rating_change'
  | 'contest_participated'
  | 'rank_change'
  | 'problem_solved'
  | 'streak_update'
  | 'profile_view'

export interface Activity {
  id: string
  user_id: string
  type: ActivityType
  platform?: 'codeforces' | 'leetcode' | 'codechef'
  old_value?: number
  new_value?: number
  contest_name?: string
  problem_name?: string
  description: string
  created_at: string
}

export type NotificationType = 
  | 'message'
  | 'follower'
  | 'contest'
  | 'rank_change'
  | 'rating_update'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  description: string
  is_read: boolean
  related_user_id?: string
  related_id?: string
  created_at: string
}
/**
 * Messaging and Chat types
 */

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  read_at?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  name: string
  avatar_url?: string
  last_message: string
  last_message_at: string
  unread_count: number
}

export interface Chat {
  id: string
  messages: Message[]
  user_id: string
  total_count: number
  page: number
  page_size: number
}
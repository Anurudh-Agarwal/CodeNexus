/**
 * Represents a chat message exchanged between two users.
 */
interface Message {
  id: string

  sender_id: string
  receiver_id: string

  content: string

  read: boolean
  read_at?: string

  created_at: string 
  updated_at: string
}

export type { Message }
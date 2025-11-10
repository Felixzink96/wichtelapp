export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          created_at: string
          name: string
          date: string
          budget: number | null
          rules: string | null
          is_drawn: boolean
          admin_secret: string
          event_code: string
          admin_pin: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          date: string
          budget?: number | null
          rules?: string | null
          is_drawn?: boolean
          admin_secret: string
          event_code: string
          admin_pin: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          date?: string
          budget?: number | null
          rules?: string | null
          is_drawn?: boolean
          admin_secret?: string
          event_code?: string
          admin_pin?: string
        }
      }
      participants: {
        Row: {
          id: string
          created_at: string
          event_id: string
          name: string
          email: string
          wishlist: string | null
          secret_token: string
          avatar_emoji: string
        }
        Insert: {
          id?: string
          created_at?: string
          event_id: string
          name: string
          email: string
          wishlist?: string | null
          secret_token: string
          avatar_emoji?: string
        }
        Update: {
          id?: string
          created_at?: string
          event_id?: string
          name?: string
          email?: string
          wishlist?: string | null
          secret_token?: string
          avatar_emoji?: string
        }
      }
      draws: {
        Row: {
          id: string
          created_at: string
          event_id: string
          giver_id: string
          receiver_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          event_id: string
          giver_id: string
          receiver_id: string
        }
        Update: {
          id?: string
          created_at?: string
          event_id?: string
          giver_id?: string
          receiver_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

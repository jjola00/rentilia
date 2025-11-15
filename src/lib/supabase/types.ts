// Database types will be generated after schema creation
// For now, we'll define basic types manually

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type BookingStatus =
  | 'pending'
  | 'requested'
  | 'paid'
  | 'picked_up'
  | 'returned_waiting_owner'
  | 'closed_no_damage'
  | 'deposit_captured'
  | 'cancelled'

export type PickupType = 'renter_pickup' | 'owner_delivery'

export type UserRole = 'renter' | 'owner' | 'admin'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string | null
          phone: string | null
          bio: string | null
          avatar_url: string | null
          city: string | null
          state: string | null
          stripe_account_id: string | null
          terms_accepted: boolean
          accepted_terms_version: number | null
          accepted_terms_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email?: string | null
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          city?: string | null
          state?: string | null
          stripe_account_id?: string | null
          terms_accepted?: boolean
          accepted_terms_version?: number | null
          accepted_terms_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          city?: string | null
          state?: string | null
          stripe_account_id?: string | null
          terms_accepted?: boolean
          accepted_terms_version?: number | null
          accepted_terms_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other table types as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status: BookingStatus
      pickup_type: PickupType
      user_role: UserRole
    }
  }
}

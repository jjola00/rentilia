// Simple utility to test Supabase connection
// Run this from a server component or API route to verify setup

import { createClient } from './client'

export async function testSupabaseConnection() {
  try {
    const supabase = createClient()
    
    // Test the connection by checking auth status
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Supabase connection error:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Supabase connection successful!')
    return { success: true, session: data.session }
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return { success: false, error: String(error) }
  }
}

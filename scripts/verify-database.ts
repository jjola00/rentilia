#!/usr/bin/env tsx
/**
 * Database Schema Verification Script
 * Checks if all required tables and policies exist in Supabase
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const REQUIRED_TABLES = [
  'profiles',
  'user_roles',
  'items',
  'bookings',
  'reviews',
  'licenses',
  'return_evidence',
  'messages'
]

async function verifyDatabase() {
  console.log('🔍 Verifying Supabase Database Setup...\n')
  
  let allGood = true
  
  // Test 1: Check if we can connect
  console.log('1️⃣  Testing connection...')
  try {
    const { error } = await supabase.auth.getSession()
    if (error) throw error
    console.log('   ✅ Connection successful\n')
  } catch (error) {
    console.error('   ❌ Connection failed:', error)
    return false
  }
  
  // Test 2: Check each table exists by trying to query it
  console.log('2️⃣  Checking tables...')
  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(0)
      
      if (error) {
        console.error(`   ❌ Table '${table}' - Error: ${error.message}`)
        allGood = false
      } else {
        console.log(`   ✅ Table '${table}' exists`)
      }
    } catch (error) {
      console.error(`   ❌ Table '${table}' - ${error}`)
      allGood = false
    }
  }
  
  console.log('\n3️⃣  Testing RLS policies...')
  // Test that RLS is enabled by trying to insert without auth (should fail)
  try {
    const { error } = await supabase
      .from('profiles')
      .insert({ id: '00000000-0000-0000-0000-000000000000', full_name: 'Test' })
    
    if (error && error.message.includes('row-level security')) {
      console.log('   ✅ RLS is enabled on profiles table')
    } else if (error) {
      console.log('   ⚠️  RLS check inconclusive:', error.message)
    } else {
      console.log('   ⚠️  RLS might not be properly configured')
    }
  } catch (error) {
    console.log('   ⚠️  RLS check error:', error)
  }
  
  console.log('\n' + '='.repeat(50))
  if (allGood) {
    console.log('✅ Database schema verification PASSED!')
    console.log('All required tables are present and accessible.')
  } else {
    console.log('❌ Database schema verification FAILED!')
    console.log('Some tables are missing or inaccessible.')
    console.log('\nPlease run the schema SQL in your Supabase dashboard.')
  }
  console.log('='.repeat(50) + '\n')
  
  return allGood
}

// Run verification
verifyDatabase()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Verification script error:', error)
    process.exit(1)
  })

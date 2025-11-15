#!/usr/bin/env tsx
/**
 * Apply database migration script
 * Reads SQL file and executes it in Supabase
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration(migrationFile: string) {
  console.log(`📦 Applying migration: ${migrationFile}\n`)
  
  try {
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'supabase', 'migrations', migrationFile)
    const sql = readFileSync(sqlPath, 'utf-8')
    
    console.log('📄 SQL content loaded')
    console.log('⚠️  Note: This script uses the anon key which has limited permissions.')
    console.log('⚠️  For full migration support, you should:')
    console.log('   1. Copy the SQL from: supabase/migrations/' + migrationFile)
    console.log('   2. Paste it in Supabase Dashboard > SQL Editor')
    console.log('   3. Click "Run"\n')
    
    console.log('SQL Preview:')
    console.log('─'.repeat(50))
    console.log(sql.substring(0, 500) + '...\n')
    console.log('─'.repeat(50))
    console.log('\n✅ Migration file is ready to be applied manually in Supabase Dashboard')
    
  } catch (error) {
    console.error('❌ Error reading migration file:', error)
    process.exit(1)
  }
}

// Get migration file from command line or use default
const migrationFile = process.argv[2] || '001_add_indexes_and_policies.sql'

applyMigration(migrationFile)

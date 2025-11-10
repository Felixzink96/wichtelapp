// Direct Database Setup via HTTP
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

// Read SQL schema
const sqlSchema = readFileSync(join(__dirname, '../supabase-schema.sql'), 'utf-8')

// Split into individual statements
const statements = sqlSchema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

console.log('🎄 Setting up Wichtel App database...\n')
console.log(`📦 Found ${statements.length} SQL statements to execute\n`)

async function executeSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ query: sql })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HTTP ${response.status}: ${error}`)
  }

  return response.json()
}

async function setupDatabase() {
  try {
    // Try using query parameter approach (Supabase PostgREST)
    console.log('🔧 Attempting direct SQL execution...\n')

    // Method 1: Try the full schema at once
    const fullSQL = statements.join(';\n')

    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({
        query: fullSQL
      })
    })

    console.log('Response status:', response.status)
    const text = await response.text()
    console.log('Response:', text)

    if (response.ok) {
      console.log('\n✅ Database setup complete!')
    } else {
      console.log('\n⚠️  Direct execution not supported.')
      console.log('Using alternative method...\n')
      await setupViaManagementAPI()
    }

  } catch (error) {
    console.log('❌ Error:', error.message)
    console.log('\n🔄 Trying alternative approach...\n')
    await setupViaManagementAPI()
  }
}

async function setupViaManagementAPI() {
  // Try using Supabase's management API
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1]

  console.log(`Project Ref: ${projectRef}`)
  console.log('\n📋 Unfortunately, Supabase requires SQL to be executed via the Dashboard for security.')
  console.log('\n✨ Quick setup (30 seconds):')
  console.log('   1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new')
  console.log('   2. Copy content from: supabase-schema.sql')
  console.log('   3. Paste and click RUN')
  console.log('\n💡 Or tell me if you want me to try a different approach!')
}

setupDatabase()

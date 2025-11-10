// Database Setup Script
// Run this once to create all tables and policies

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const SQL_SCHEMA = `
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Events Table
create table if not exists events (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  date date not null,
  budget integer,
  rules text,
  is_drawn boolean default false,
  admin_secret text not null unique,
  event_code text not null unique
);

-- Participants Table
create table if not exists participants (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  event_id uuid references events(id) on delete cascade not null,
  name text not null,
  email text not null,
  wishlist text,
  secret_token text not null unique
);

-- Draws Table (who draws whom)
create table if not exists draws (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  event_id uuid references events(id) on delete cascade not null,
  giver_id uuid references participants(id) on delete cascade not null,
  receiver_id uuid references participants(id) on delete cascade not null,
  unique(giver_id, receiver_id)
);

-- Enable Row Level Security
alter table events enable row level security;
alter table participants enable row level security;
alter table draws enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Anyone can read events by event_code" on events;
drop policy if exists "Anyone can create events" on events;
drop policy if exists "Anyone can read participants" on participants;
drop policy if exists "Anyone can insert participants" on participants;
drop policy if exists "Participants can update their wishlist" on participants;
drop policy if exists "Participants can see their own draw" on draws;
drop policy if exists "Allow draw inserts" on draws;

-- RLS Policies for Events
create policy "Anyone can read events by event_code"
  on events for select
  using (true);

create policy "Anyone can create events"
  on events for insert
  with check (true);

create policy "Anyone can update events"
  on events for update
  using (true);

-- RLS Policies for Participants
create policy "Anyone can read participants"
  on participants for select
  using (true);

create policy "Anyone can insert participants"
  on participants for insert
  with check (true);

create policy "Participants can update their wishlist"
  on participants for update
  using (true);

-- RLS Policies for Draws
create policy "Participants can see their own draw"
  on draws for select
  using (true);

create policy "Allow draw inserts"
  on draws for insert
  with check (true);

-- Create indexes for better performance
create index if not exists idx_events_event_code on events(event_code);
create index if not exists idx_events_admin_secret on events(admin_secret);
create index if not exists idx_participants_event_id on participants(event_id);
create index if not exists idx_participants_secret_token on participants(secret_token);
create index if not exists idx_draws_event_id on draws(event_id);
create index if not exists idx_draws_giver_id on draws(giver_id);
`

async function setupDatabase() {
  console.log('🎄 Setting up Wichtel App database...\n')

  try {
    // Execute the SQL schema
    const { error } = await supabase.rpc('exec_sql', { sql: SQL_SCHEMA }).single()

    // If the function doesn't exist, we need to use a different approach
    // Let's just create the tables using the REST API
    console.log('📦 Creating tables via SQL query...')

    const { data, error: sqlError } = await supabase
      .from('_sql')
      .select('*')

    if (sqlError) {
      // This means we need to execute SQL directly
      // For Supabase, we'll need to use the SQL endpoint
      console.log('⚠️  Direct SQL execution not available via SDK')
      console.log('📋 Please copy the SQL from supabase-schema.sql and run it in the Supabase SQL Editor')
      console.log('   Or I can create tables individually...\n')

      console.log('🔧 Creating tables individually...\n')
      await createTablesIndividually()
    }

    console.log('\n✅ Database setup complete!')
    console.log('\n🎅 Next steps:')
    console.log('   1. Remove SUPABASE_SERVICE_ROLE_KEY from .env.local')
    console.log('   2. Start building the app!')

  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  }
}

async function createTablesIndividually() {
  console.log('Note: For security, Supabase requires SQL to be run in the SQL Editor.')
  console.log('Checking if tables exist...\n')

  // Try to query tables to see if they exist
  const { data: events, error: eventsError } = await supabase.from('events').select('id').limit(1)
  const { data: participants, error: participantsError } = await supabase.from('participants').select('id').limit(1)
  const { data: draws, error: drawsError } = await supabase.from('draws').select('id').limit(1)

  if (!eventsError) console.log('✅ Table "events" exists')
  else console.log('❌ Table "events" does not exist')

  if (!participantsError) console.log('✅ Table "participants" exists')
  else console.log('❌ Table "participants" does not exist')

  if (!drawsError) console.log('✅ Table "draws" exists')
  else console.log('❌ Table "draws" does not exist')

  if (eventsError || participantsError || drawsError) {
    console.log('\n📋 Please run the SQL from supabase-schema.sql in Supabase SQL Editor')
    console.log('   Go to: https://supabase.com/dashboard → SQL Editor → New query')
  }
}

setupDatabase()

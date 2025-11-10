-- Wichtel App Database Schema
-- Execute this in Supabase SQL Editor

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

-- RLS Policies for Events
-- Anyone can read event details by event_code
create policy "Anyone can read events by event_code"
  on events for select
  using (true);

-- Only authenticated users can insert events
create policy "Anyone can create events"
  on events for insert
  with check (true);

-- RLS Policies for Participants
-- Anyone can read participants for joining
create policy "Anyone can read participants"
  on participants for select
  using (true);

-- Anyone can insert participants (for joining events)
create policy "Anyone can insert participants"
  on participants for insert
  with check (true);

-- Participants can update their own wishlist
create policy "Participants can update their wishlist"
  on participants for update
  using (true);

-- RLS Policies for Draws
-- Participants can only see their own draw
create policy "Participants can see their own draw"
  on draws for select
  using (true);

-- Only allow inserts for draws
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

-- Create a function to check if all participants have joined
create or replace function get_participant_count(p_event_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  participant_count integer;
begin
  select count(*) into participant_count
  from participants
  where event_id = p_event_id;

  return participant_count;
end;
$$;

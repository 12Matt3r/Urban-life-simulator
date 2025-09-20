-- Migration: setup_urban_life_simulator_schema
-- Created at: 1758184871

-- Urban Life Simulator Database Schema
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Stations table for radio functionality
create table if not exists public.stations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  genre text,
  mood_tags text[] default '{}',
  created_at timestamptz default now()
);

-- Tracks table for uploaded radio content
create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  station_id uuid references public.stations(id) on delete cascade,
  title text not null,
  artist text not null,
  file_path text not null,
  created_by uuid references auth.users(id),
  votes int default 0,
  created_at timestamptz default now()
);

-- Saves table for game state persistence
create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  slot text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  unique(user_id, slot)
);

-- Enable Row Level Security
alter table public.stations enable row level security;
alter table public.tracks enable row level security;
alter table public.saves enable row level security;

-- RLS Policies for stations (public read)
create policy "stations_public_read"
on public.stations for select using (true);

-- RLS Policies for tracks (public read, authenticated insert)
create policy "tracks_public_read"
on public.tracks for select using (true);

create policy "tracks_authenticated_insert"
on public.tracks for insert with check (auth.role() = 'authenticated');

-- RLS Policies for saves (user owns their saves)
create policy "saves_owner_read"
on public.saves for select using (user_id = auth.uid());

create policy "saves_owner_insert"
on public.saves for insert with check (user_id = auth.uid());

create policy "saves_owner_update"
on public.saves for update using (user_id = auth.uid());

-- Sample radio stations data
insert into public.stations (name, genre, mood_tags) values
  ('Vantage Point Lo-Fi', 'Lo-Fi', array['calm','melancholy']),
  ('Heatwave Radio', 'Trap', array['aggressive','tense']),
  ('Resonance FM', 'Ambient', array['calm','dystopian']),
  ('NCPD Public Broadcast', 'News', array['tense','informational']),
  ('Serenity Classical', 'Classical', array['calm','uplifting'])
on conflict (name) do nothing;;
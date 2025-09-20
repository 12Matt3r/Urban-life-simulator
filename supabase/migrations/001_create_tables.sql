-- Stations
create table if not exists stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  moods text[] default '{}',
  created_at timestamp with time zone default now()
);

-- Tracks
create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  station_id uuid references stations(id) on delete cascade,
  title text not null,
  artist text not null,
  file_name text,            -- stored filename in storage bucket (optional)
  votes int default 0,
  created_by uuid,           -- auth.uid()
  created_at timestamp with time zone default now()
);

-- Story packs
create table if not exists story_packs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  json jsonb not null,
  created_by uuid,
  created_at timestamp with time zone default now()
);

-- Saves
create table if not exists saves (
  id uuid primary key default gen_random_uuid(),
  profile uuid,              -- auth.uid()
  slot text not null,
  data jsonb not null,
  updated_at timestamp with time zone default now(),
  unique (profile, slot)
);

-- RLS
alter table stations enable row level security;
alter table tracks enable row level security;
alter table story_packs enable row level security;
alter table saves enable row level security;

-- Policies (public read for stations/tracks, auth write)
create policy "stations read" on stations for select using (true);
create policy "tracks read"   on tracks   for select using (true);

create policy "stations write" on stations for insert with check (auth.uid() is not null);
create policy "tracks write"   on tracks   for insert with check (auth.uid() is not null);

create policy "packs read"  on story_packs for select using (true);
create policy "packs write" on story_packs for insert with check (auth.uid() is not null);

create policy "saves read own"  on saves for select using (profile = auth.uid());
create policy "saves upsert own" on saves for insert with check (profile = auth.uid());
create policy "saves update own" on saves for update using (profile = auth.uid());
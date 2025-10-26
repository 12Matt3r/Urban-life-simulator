/*
  # Urban Life Simulator - Core Database Schema

  ## Overview
  This migration creates the complete database schema for Urban Life Simulator,
  including player profiles, game saves, transcripts, stats tracking, and achievements.

  ## 1. New Tables

  ### `players`
  - `id` (uuid, primary key) - Links to auth.users
  - `username` (text, unique) - Player display name
  - `created_at` (timestamptz) - Account creation timestamp
  - `last_login` (timestamptz) - Last login timestamp
  - `total_playtime_seconds` (integer) - Total time played
  - `preferences` (jsonb) - User preferences (theme, narrator mode, etc.)

  ### `game_saves`
  - `id` (uuid, primary key)
  - `player_id` (uuid, foreign key) - Links to players
  - `save_name` (text) - User-defined save name
  - `realm` (text) - Current realm (tutorial, city, dreamworld, etc.)
  - `stats` (jsonb) - Current player stats (health, sanity, money, etc.)
  - `inventory` (jsonb) - Player inventory items
  - `flags` (jsonb) - Game state flags and progress markers
  - `position` (jsonb) - Current location/scene data
  - `created_at` (timestamptz) - Save creation time
  - `updated_at` (timestamptz) - Last save update time
  - `is_autosave` (boolean) - Whether this is an autosave

  ### `transcripts`
  - `id` (uuid, primary key)
  - `player_id` (uuid, foreign key) - Links to players
  - `save_id` (uuid, foreign key, nullable) - Associated save
  - `session_start` (timestamptz) - Session start time
  - `session_end` (timestamptz, nullable) - Session end time
  - `events` (jsonb) - Array of game events and narrative beats
  - `realm` (text) - Realm where session occurred
  - `stats_snapshot` (jsonb) - Stats at session end

  ### `player_stats`
  - `id` (uuid, primary key)
  - `player_id` (uuid, foreign key, unique) - Links to players
  - `total_decisions` (integer) - Total decisions made
  - `tutorial_completed` (boolean) - Tutorial completion status
  - `monkey_paw_awarded` (boolean) - Whether player earned Monkey Paw
  - `realms_unlocked` (text[]) - Array of unlocked realms
  - `achievements` (jsonb) - Achievement data
  - `high_scores` (jsonb) - High score tracking per realm
  - `updated_at` (timestamptz) - Last update time

  ## 2. Security
  - Enable RLS on all tables
  - Players can only access their own data
  - Authenticated users required for all operations
  - Strict ownership checks on all policies

  ## 3. Indexes
  - Index on player_id for efficient queries
  - Index on save timestamps for recent saves
  - Index on session timestamps for transcript queries

  ## 4. Important Notes
  - All tables use `gen_random_uuid()` for primary keys
  - Default values set for counters and booleans
  - JSONB used for flexible game state storage
  - Timestamps automatically set with `now()`
*/

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_login timestamptz DEFAULT now() NOT NULL,
  total_playtime_seconds integer DEFAULT 0 NOT NULL,
  preferences jsonb DEFAULT '{}'::jsonb NOT NULL
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own profile"
  ON players FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Players can update own profile"
  ON players FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Players can insert own profile"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Game saves table
CREATE TABLE IF NOT EXISTS game_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  save_name text NOT NULL,
  realm text DEFAULT 'tutorial' NOT NULL,
  stats jsonb DEFAULT '{}'::jsonb NOT NULL,
  inventory jsonb DEFAULT '[]'::jsonb NOT NULL,
  flags jsonb DEFAULT '{}'::jsonb NOT NULL,
  position jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  is_autosave boolean DEFAULT false NOT NULL
);

ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own saves"
  ON game_saves FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Players can create own saves"
  ON game_saves FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can update own saves"
  ON game_saves FOR UPDATE
  TO authenticated
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can delete own saves"
  ON game_saves FOR DELETE
  TO authenticated
  USING (player_id = auth.uid());

-- Create index for efficient save queries
CREATE INDEX IF NOT EXISTS idx_game_saves_player_id ON game_saves(player_id);
CREATE INDEX IF NOT EXISTS idx_game_saves_updated_at ON game_saves(updated_at DESC);

-- Transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  save_id uuid REFERENCES game_saves(id) ON DELETE SET NULL,
  session_start timestamptz DEFAULT now() NOT NULL,
  session_end timestamptz,
  events jsonb DEFAULT '[]'::jsonb NOT NULL,
  realm text NOT NULL,
  stats_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL
);

ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own transcripts"
  ON transcripts FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Players can create own transcripts"
  ON transcripts FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can update own transcripts"
  ON transcripts FOR UPDATE
  TO authenticated
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can delete own transcripts"
  ON transcripts FOR DELETE
  TO authenticated
  USING (player_id = auth.uid());

-- Create index for efficient transcript queries
CREATE INDEX IF NOT EXISTS idx_transcripts_player_id ON transcripts(player_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_session_start ON transcripts(session_start DESC);

-- Player stats table
CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid UNIQUE NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  total_decisions integer DEFAULT 0 NOT NULL,
  tutorial_completed boolean DEFAULT false NOT NULL,
  monkey_paw_awarded boolean DEFAULT false NOT NULL,
  realms_unlocked text[] DEFAULT ARRAY['tutorial']::text[] NOT NULL,
  achievements jsonb DEFAULT '{}'::jsonb NOT NULL,
  high_scores jsonb DEFAULT '{}'::jsonb NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own stats"
  ON player_stats FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Players can create own stats"
  ON player_stats FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can update own stats"
  ON player_stats FOR UPDATE
  TO authenticated
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

-- Create index for efficient stats queries
CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON player_stats(player_id);

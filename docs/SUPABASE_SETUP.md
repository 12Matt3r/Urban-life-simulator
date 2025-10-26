# Supabase Setup Guide for Urban Life Simulator

## Overview

This document explains the complete Supabase backend integration for Urban Life Simulator, including database schema, authentication setup, and usage patterns.

## Database Schema

The Urban Life Simulator uses four core tables:

### 1. players

Stores user profiles and preferences.

```sql
CREATE TABLE players (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_login timestamptz DEFAULT now() NOT NULL,
  total_playtime_seconds integer DEFAULT 0 NOT NULL,
  preferences jsonb DEFAULT '{}'::jsonb NOT NULL
);
```

**Columns:**
- `id` - Links to Supabase auth.users
- `username` - Display name (unique)
- `created_at` - Account creation timestamp
- `last_login` - Last login timestamp (auto-updated)
- `total_playtime_seconds` - Cumulative playtime
- `preferences` - JSON object with settings:
  - `narratorMode`: 'pg13' | 'adult'
  - `theme`: 'dark' | 'light'
  - `sfxVolume`: 0.0 - 1.0
  - `musicVolume`: 0.0 - 1.0

### 2. game_saves

Stores game state snapshots.

```sql
CREATE TABLE game_saves (
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
```

**Columns:**
- `id` - Unique save identifier
- `player_id` - Owner of this save
- `save_name` - User-defined name or autosave_YYYY-MM-DD
- `realm` - Current realm (tutorial, city, dreamworld, etc.)
- `stats` - JSON object with player stats (health, sanity, money, etc.)
- `inventory` - Array of inventory items
- `flags` - Game state flags (tutorialComplete, monkeyPawAwarded, etc.)
- `position` - Current location data (day, hour, minute)
- `is_autosave` - Whether this is an automatic save

### 3. transcripts

Records narrative sessions for replay/analysis.

```sql
CREATE TABLE transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  save_id uuid REFERENCES game_saves(id) ON DELETE SET NULL,
  session_start timestamptz DEFAULT now() NOT NULL,
  session_end timestamptz,
  events jsonb DEFAULT '[]'::jsonb NOT NULL,
  realm text NOT NULL,
  stats_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL
);
```

**Columns:**
- `id` - Unique transcript identifier
- `player_id` - Owner of this transcript
- `save_id` - Associated save (optional)
- `session_start` - When session began
- `session_end` - When session ended (null if active)
- `events` - Array of game events:
  - `{ type: 'narrative', text: '...', imagePrompt: '...' }`
  - `{ type: 'decision', decision: '...', outcome: '...' }`
- `realm` - Where session occurred
- `stats_snapshot` - Final player stats

### 4. player_stats

Tracks achievements, progress, and analytics.

```sql
CREATE TABLE player_stats (
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
```

**Columns:**
- `player_id` - One-to-one with players table
- `total_decisions` - Cumulative decision count
- `tutorial_completed` - Tutorial completion flag
- `monkey_paw_awarded` - Special item flag
- `realms_unlocked` - Array of accessible realms
- `achievements` - JSON object: `{ achievementId: { unlocked_at, ... } }`
- `high_scores` - JSON object: `{ realm: score }`

## Row Level Security (RLS)

All tables have RLS enabled with restrictive policies:

### players
- Users can view their own profile
- Users can update their own profile
- Users can insert their own profile on signup

### game_saves
- Users can view/create/update/delete only their own saves

### transcripts
- Users can view/create/update/delete only their own transcripts

### player_stats
- Users can view/create/update only their own stats

**Security Guarantee:** No user can access another user's data.

## Authentication

### Sign Up (Email/Password)

```javascript
import { signUp } from './src/utils/auth.js';

await signUp('user@example.com', 'password123', 'CoolPlayer');
```

Creates:
1. Auth user in `auth.users`
2. Profile in `players` table
3. Initial stats in `player_stats` table

### Sign In

```javascript
import { signIn } from './src/utils/auth.js';

await signIn('user@example.com', 'password123');
```

### Anonymous Sign In

```javascript
import { signInAnonymously } from './src/utils/auth.js';

await signInAnonymously();
```

Creates a temporary session with auto-generated username.

### Sign Out

```javascript
import { signOut } from './src/utils/auth.js';

await signOut();
```

### Auth State Listener

```javascript
import { onAuthStateChange } from './src/utils/auth.js';

const unsubscribe = onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});
```

## Save/Load System

### Save Game

```javascript
import { saveGame } from './src/utils/storage.js';
import { GameManager } from './src/systems/game.js';

const gameState = GameManager.getGameState();
await saveGame('My Save', gameState);
```

### Load Game

```javascript
import { loadGame } from './src/utils/storage.js';
import { GameManager } from './src/systems/game.js';

const save = await loadGame(saveId);
GameManager.loadGameState(save);
```

### Autosave

Automatically triggered every 5 minutes:

```javascript
import { autoSave } from './src/utils/storage.js';

await autoSave(gameState);
```

Creates/updates a save named `autosave_YYYY-MM-DD`.

### Get All Saves

```javascript
import { getAllSaves } from './src/utils/storage.js';

const saves = await getAllSaves();
```

Returns array sorted by `updated_at` (most recent first).

### Delete Save

```javascript
import { deleteSave } from './src/utils/storage.js';

await deleteSave(saveId);
```

## Transcript System

### Create Transcript

```javascript
import { createTranscript } from './src/utils/db.js';

const transcript = await createTranscript('city', [
  { type: 'narrative', text: 'You wake up in the city...' }
]);
```

### Update Transcript

```javascript
import { updateTranscript } from './src/utils/db.js';

await updateTranscript(transcriptId, events, statsSnapshot);
```

### Export Transcript

```javascript
import { exportTranscript } from './src/utils/storage.js';

await exportTranscript(transcriptId, 'json');
await exportTranscript(transcriptId, 'txt');
```

Downloads transcript as JSON or formatted text file.

## Player Stats

### Mark Tutorial Complete

```javascript
import { markTutorialComplete } from './src/utils/db.js';

await markTutorialComplete();
```

### Award Monkey Paw

```javascript
import { awardMonkeyPaw } from './src/utils/db.js';

await awardMonkeyPaw();
```

### Unlock Realm

```javascript
import { unlockRealm } from './src/utils/db.js';

await unlockRealm('dreamworld');
```

### Check Realm Access

```javascript
import { isRealmUnlocked } from './src/utils/db.js';

const canAccess = await isRealmUnlocked('dreamworld');
```

### Record Achievement

```javascript
import { recordAchievement } from './src/utils/db.js';

await recordAchievement('first_decision', {
  name: 'First Decision',
  description: 'Made your first choice',
  rarity: 'common'
});
```

### Update High Score

```javascript
import { updateHighScore } from './src/utils/db.js';

await updateHighScore('city', 1000);
```

Only updates if new score is higher than existing.

## Integration with GameManager

The GameManager automatically integrates with Supabase:

### Recording Decisions

```javascript
GameManager.recordDecision('Help the stranger', 'Gained +10 reputation');
```

Automatically:
- Adds event to transcript
- Increments decision count in database
- Includes current stats snapshot

### Recording Narrative

```javascript
GameManager.recordNarrative('You enter the neon-lit bar...', 'cyberpunk bar interior');
```

Adds narrative event to current transcript.

### Tutorial Completion

```javascript
GameManager.completeTutorial();
```

Automatically:
- Sets flag in game state
- Updates database
- Publishes 'tutorial:completed' event

### Granting Monkey Paw

```javascript
GameManager.grantMonkeyPaw();
```

Only works if tutorial is complete. Automatically:
- Sets flag in game state
- Updates database
- Publishes 'monkeypaw:awarded' event

### Autosave

Runs every 5 minutes automatically:

```javascript
GameManager.performAutoSave();
```

## Error Handling

All database operations handle errors gracefully:

```javascript
try {
  await saveGame('My Save', gameState);
} catch (error) {
  console.error('Save failed:', error.message);
}
```

Common error scenarios:
- User not authenticated
- Network failure
- RLS policy violation
- Invalid data format

## Best Practices

1. **Always check authentication:**
   ```javascript
   import { isAuthenticated } from './src/utils/auth.js';

   if (await isAuthenticated()) {
     // Proceed with database operations
   }
   ```

2. **Use try-catch for critical operations:**
   ```javascript
   try {
     await saveGame('Important Save', gameState);
   } catch (error) {
     // Show error to user
   }
   ```

3. **Rely on autosave for background persistence:**
   - Manual saves for player-initiated saves
   - Autosave for safety net

4. **Clean up transcripts periodically:**
   - Export important sessions
   - Delete old transcripts to save space

5. **Test with anonymous users first:**
   - Simplifies development
   - Can upgrade to full auth later

## Environment Variables

Required in `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Migration Applied

The schema migration has been applied with filename:
- `create_uls_core_schema`

To view in Supabase dashboard:
1. Go to Database → Migrations
2. Look for `create_uls_core_schema`
3. View applied timestamp

## Database Indexes

Optimizations in place:
- `idx_game_saves_player_id` - Fast save queries by player
- `idx_game_saves_updated_at` - Fast recent save queries
- `idx_transcripts_player_id` - Fast transcript queries by player
- `idx_transcripts_session_start` - Fast session history queries
- `idx_player_stats_player_id` - Fast stats lookups

## Next Steps

1. **Test Authentication:**
   - Sign up new user
   - Verify profile created
   - Check stats initialized

2. **Test Save/Load:**
   - Make manual save
   - Load save in new session
   - Verify state restored

3. **Test Transcripts:**
   - Play through tutorial
   - Check events recorded
   - Export transcript

4. **Monitor Performance:**
   - Check autosave timing
   - Verify RLS performance
   - Monitor database size

import { getSupabaseClient, getCurrentUser } from './auth.js';

export async function getPlayerProfile() {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch player profile: ${error.message}`);
  }

  return data;
}

export async function updatePlayerProfile(updates) {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update player profile: ${error.message}`);
  }

  return data;
}

export async function getPlayerStats() {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('player_stats')
    .select('*')
    .eq('player_id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch player stats: ${error.message}`);
  }

  return data;
}

export async function updatePlayerStats(updates) {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('player_stats')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('player_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update player stats: ${error.message}`);
  }

  return data;
}

export async function incrementDecisionCount() {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    return;
  }

  const stats = await getPlayerStats();

  if (stats) {
    await updatePlayerStats({
      total_decisions: (stats.total_decisions || 0) + 1
    });
  }
}

export async function markTutorialComplete() {
  return updatePlayerStats({
    tutorial_completed: true
  });
}

export async function awardMonkeyPaw() {
  return updatePlayerStats({
    monkey_paw_awarded: true
  });
}

export async function unlockRealm(realmName) {
  const stats = await getPlayerStats();

  if (!stats) {
    throw new Error('Player stats not found');
  }

  const currentRealms = stats.realms_unlocked || ['tutorial'];

  if (!currentRealms.includes(realmName)) {
    return updatePlayerStats({
      realms_unlocked: [...currentRealms, realmName]
    });
  }

  return stats;
}

export async function isRealmUnlocked(realmName) {
  const stats = await getPlayerStats();

  if (!stats) {
    return false;
  }

  return (stats.realms_unlocked || ['tutorial']).includes(realmName);
}

export async function recordAchievement(achievementId, achievementData) {
  const stats = await getPlayerStats();

  if (!stats) {
    throw new Error('Player stats not found');
  }

  const achievements = stats.achievements || {};
  achievements[achievementId] = {
    ...achievementData,
    unlocked_at: new Date().toISOString()
  };

  return updatePlayerStats({
    achievements
  });
}

export async function updateHighScore(realm, score) {
  const stats = await getPlayerStats();

  if (!stats) {
    throw new Error('Player stats not found');
  }

  const highScores = stats.high_scores || {};
  const currentHigh = highScores[realm] || 0;

  if (score > currentHigh) {
    highScores[realm] = score;

    return updatePlayerStats({
      high_scores: highScores
    });
  }

  return stats;
}

export async function createTranscript(realm, initialEvents = []) {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('transcripts')
    .insert({
      player_id: user.id,
      realm,
      events: initialEvents,
      session_start: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create transcript: ${error.message}`);
  }

  return data;
}

export async function updateTranscript(transcriptId, events, statsSnapshot) {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('transcripts')
    .update({
      events,
      stats_snapshot: statsSnapshot,
      session_end: new Date().toISOString()
    })
    .eq('id', transcriptId)
    .eq('player_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update transcript: ${error.message}`);
  }

  return data;
}

export async function getTranscripts(limit = 10) {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('transcripts')
    .select('*')
    .eq('player_id', user.id)
    .order('session_start', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch transcripts: ${error.message}`);
  }

  return data;
}

export async function deleteTranscript(transcriptId) {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('transcripts')
    .delete()
    .eq('id', transcriptId)
    .eq('player_id', user.id);

  if (error) {
    throw new Error(`Failed to delete transcript: ${error.message}`);
  }
}

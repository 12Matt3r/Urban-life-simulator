import { getSupabaseClient, getCurrentUser } from './auth.js';

export async function saveGame(saveName, gameState, isAutosave = false) {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const saveData = {
    player_id: user.id,
    save_name: saveName,
    realm: gameState.realm || 'tutorial',
    stats: gameState.stats || {},
    inventory: gameState.inventory || [],
    flags: gameState.flags || {},
    position: gameState.position || {},
    is_autosave: isAutosave,
    updated_at: new Date().toISOString()
  };

  const existingSave = await findSaveByName(saveName);

  if (existingSave && existingSave.player_id === user.id) {
    const { data, error } = await supabase
      .from('game_saves')
      .update(saveData)
      .eq('id', existingSave.id)
      .eq('player_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update save: ${error.message}`);
    }

    return data;
  } else {
    const { data, error } = await supabase
      .from('game_saves')
      .insert(saveData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create save: ${error.message}`);
    }

    return data;
  }
}

export async function loadGame(saveId) {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('game_saves')
    .select('*')
    .eq('id', saveId)
    .eq('player_id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load save: ${error.message}`);
  }

  if (!data) {
    throw new Error('Save not found');
  }

  return data;
}

export async function loadMostRecentSave() {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('game_saves')
    .select('*')
    .eq('player_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load recent save: ${error.message}`);
  }

  return data;
}

export async function getAllSaves() {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('game_saves')
    .select('*')
    .eq('player_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch saves: ${error.message}`);
  }

  return data || [];
}

export async function deleteSave(saveId) {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('game_saves')
    .delete()
    .eq('id', saveId)
    .eq('player_id', user.id);

  if (error) {
    throw new Error(`Failed to delete save: ${error.message}`);
  }
}

async function findSaveByName(saveName) {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('game_saves')
    .select('*')
    .eq('player_id', user.id)
    .eq('save_name', saveName)
    .maybeSingle();

  if (error) {
    console.error('Error finding save by name:', error);
    return null;
  }

  return data;
}

export async function autoSave(gameState) {
  const timestamp = new Date().toISOString().split('T')[0];
  const saveName = `autosave_${timestamp}`;

  return saveGame(saveName, gameState, true);
}

export async function exportTranscript(transcriptId, format = 'json') {
  const supabase = getSupabaseClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('transcripts')
    .select('*')
    .eq('id', transcriptId)
    .eq('player_id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch transcript: ${error.message}`);
  }

  if (!data) {
    throw new Error('Transcript not found');
  }

  if (format === 'json') {
    return exportTranscriptAsJSON(data);
  } else if (format === 'txt') {
    return exportTranscriptAsText(data);
  } else {
    throw new Error(`Unsupported format: ${format}`);
  }
}

function exportTranscriptAsJSON(transcript) {
  const jsonString = JSON.stringify(transcript, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const filename = `uls_transcript_${transcript.id.substring(0, 8)}.json`;
  downloadFile(url, filename);

  return { success: true, format: 'json', filename };
}

function exportTranscriptAsText(transcript) {
  let text = `Urban Life Simulator - Transcript Export\n`;
  text += `========================================\n\n`;
  text += `Session Start: ${new Date(transcript.session_start).toLocaleString()}\n`;

  if (transcript.session_end) {
    text += `Session End: ${new Date(transcript.session_end).toLocaleString()}\n`;
  }

  text += `Realm: ${transcript.realm}\n\n`;
  text += `Events:\n`;
  text += `-------\n\n`;

  if (Array.isArray(transcript.events)) {
    transcript.events.forEach((event, index) => {
      text += `[${index + 1}] ${event.type || 'Event'}\n`;

      if (event.text) {
        text += `${event.text}\n`;
      }

      if (event.choice) {
        text += `→ Choice: ${event.choice}\n`;
      }

      text += `\n`;
    });
  }

  if (transcript.stats_snapshot) {
    text += `\nFinal Stats:\n`;
    text += `-----------\n`;
    Object.entries(transcript.stats_snapshot).forEach(([key, value]) => {
      text += `${key}: ${value}\n`;
    });
  }

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const filename = `uls_transcript_${transcript.id.substring(0, 8)}.txt`;
  downloadFile(url, filename);

  return { success: true, format: 'txt', filename };
}

function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportSaveGame(saveId) {
  const save = await loadGame(saveId);

  if (!save) {
    throw new Error('Save not found');
  }

  const jsonString = JSON.stringify(save, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const filename = `uls_save_${save.save_name.replace(/\s+/g, '_')}.json`;
  downloadFile(url, filename);

  return { success: true, filename };
}

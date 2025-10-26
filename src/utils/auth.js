import { createClient } from '@supabase/supabase-js';
import { ULS_CONFIG } from '../config.js';

let supabaseClient = null;
let currentUser = null;
let authStateListeners = [];

export function initializeAuth() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      ULS_CONFIG.SUPABASE.URL,
      ULS_CONFIG.SUPABASE.ANON_KEY
    );

    supabaseClient.auth.onAuthStateChange((event, session) => {
      (async () => {
        currentUser = session?.user || null;

        if (currentUser) {
          await ensurePlayerProfile(currentUser);
        }

        authStateListeners.forEach(listener => {
          try {
            listener(event, session);
          } catch (err) {
            console.error('Auth state listener error:', err);
          }
        });
      })();
    });
  }

  return supabaseClient;
}

export function getSupabaseClient() {
  if (!supabaseClient) {
    return initializeAuth();
  }
  return supabaseClient;
}

export function getCurrentUser() {
  return currentUser;
}

export function onAuthStateChange(callback) {
  authStateListeners.push(callback);

  return () => {
    authStateListeners = authStateListeners.filter(listener => listener !== callback);
  };
}

export async function signUp(email, password, username) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username
      }
    }
  });

  if (error) {
    throw new Error(`Sign up failed: ${error.message}`);
  }

  if (data.user) {
    await createPlayerProfile(data.user, username);
  }

  return data;
}

export async function signIn(email, password) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(`Sign in failed: ${error.message}`);
  }

  if (data.user) {
    await updateLastLogin(data.user.id);
  }

  return data;
}

export async function signInAnonymously() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw new Error(`Anonymous sign in failed: ${error.message}`);
  }

  if (data.user) {
    await ensurePlayerProfile(data.user);
  }

  return data;
}

export async function signOut() {
  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Sign out failed: ${error.message}`);
  }

  currentUser = null;
}

export async function getSession() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Get session error:', error);
    return null;
  }

  return data.session;
}

async function ensurePlayerProfile(user) {
  const supabase = getSupabaseClient();

  const { data: existing } = await supabase
    .from('players')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!existing) {
    const username = user.user_metadata?.username ||
                    user.email?.split('@')[0] ||
                    `player_${user.id.substring(0, 8)}`;

    await createPlayerProfile(user, username);
  } else {
    await updateLastLogin(user.id);
  }
}

async function createPlayerProfile(user, username) {
  const supabase = getSupabaseClient();

  const { error: playerError } = await supabase
    .from('players')
    .insert({
      id: user.id,
      username,
      preferences: {
        narratorMode: 'pg13',
        theme: 'dark',
        sfxVolume: 0.7,
        musicVolume: 0.5
      }
    });

  if (playerError) {
    console.error('Failed to create player profile:', playerError);
    throw new Error(`Profile creation failed: ${playerError.message}`);
  }

  const { error: statsError } = await supabase
    .from('player_stats')
    .insert({
      player_id: user.id
    });

  if (statsError) {
    console.error('Failed to create player stats:', statsError);
  }
}

async function updateLastLogin(userId) {
  const supabase = getSupabaseClient();

  await supabase
    .from('players')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId);
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

export async function requireAuth() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    throw new Error('Authentication required');
  }

  return getCurrentUser();
}

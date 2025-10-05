import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from Vite's environment variables
// The VITE_ prefix is required for them to be exposed to the client.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize the client only if the credentials are provided
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn('Supabase credentials not found in .env file. Database features will be disabled.');
}

/**
 * DB
 * A dedicated data layer for all Supabase interactions.
 */
export const DB = {
  /**
   * Fetches a user's profile.
   * @param {string} userId The ID of the user to fetch.
   * @returns {Promise<object|null>} The user's profile data or null.
   */
  async getProfile(userId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);
      throw new Error(error.message);
    }
    return data;
  },

  /**
   * Creates or updates a score for a user.
   * @param {{ userId: string, score: number }} scoreData The score data to upsert.
   * @returns {Promise<object|null>} The upserted data or null.
   */
  async upsertScore({ userId, score }) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('scores')
      .upsert({ user_id: userId, score });

    if (error) {
      console.error('Error upserting score:', error.message);
      throw new Error(error.message);
    }
    return data;
  }
};
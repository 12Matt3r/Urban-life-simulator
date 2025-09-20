// systems/db.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const url = window.__ENV__?.SUPABASE_URL;
const key = window.__ENV__?.SUPABASE_ANON_KEY;

export const supabase = (url && key) ? createClient(url, key) : null;

export async function ensureAuth() {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return session.user;
  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export async function cloudSave(slot, data) {
  if (!supabase) throw new Error("Supabase not configured");
  const user = await ensureAuth();
  if (!user) throw new Error("No auth user");
  const payload = { user_id: user.id, slot, data, updated_at: new Date().toISOString() };
  const { error } = await supabase.from("saves").upsert(payload, { onConflict: "user_id,slot" });
  if (error) throw error;
}

export async function cloudLoad(slot) {
  if (!supabase) throw new Error("Supabase not configured");
  const user = await ensureAuth();
  if (!user) throw new Error("No auth user");
  const { data, error } = await supabase.from("saves")
    .select("data, updated_at").eq("user_id", user.id).eq("slot", slot).maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function listStations() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("stations").select("*").order("name");
  if (error) throw error;
  return data || [];
}

export async function uploadTrackToStation({ stationId, title, artist, file }) {
  if (!supabase) throw new Error("Supabase not configured");
  const user = await ensureAuth();
  if (!user) throw new Error("No auth user");
  const ext = file.name.split(".").pop()?.toLowerCase() || "mp3";
  const objectPath = `${user.id}/${Date.now()}_${sanitize(title)}.${ext}`;

  const up = await supabase.storage.from("radio").upload(objectPath, file, { cacheControl: "3600", upsert: false });
  if (up.error) throw up.error;
  const { data: pub } = supabase.storage.from("radio").getPublicUrl(objectPath);

  const ins = await supabase.from("tracks").insert({
    station_id: stationId, title, artist, file_path: objectPath, created_by: user.id
  }).select("id").single();
  if (ins.error) throw ins.error;

  return { trackId: ins.data.id, url: pub.publicUrl };
}

function sanitize(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }

/** Return the latest track's public URL for a station (or null). */
export async function getLatestTrackPublicUrl(stationId) {
  if (!supabase) return null;
  // Find a track row for this station, newest first
  const { data, error } = await supabase
    .from('tracks')
    .select('file_path')
    .eq('station_id', stationId)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) { console.warn('list tracks error', error.message); return null; }
  const filePath = data?.[0]?.file_path;
  if (!filePath) return null;
  const { data: pub } = supabase.storage.from('radio').getPublicUrl(filePath);
  return pub?.publicUrl || null;
}

/** Resolve a playable URL from an arbitrary user-provided URL.
 * - If it looks like a direct audio file (mp3/ogg/wav), return it for <audio>.
 * - If YouTube/SoundCloud, return an iframe embed URL (string starting with 'iframe:')
 */
export function resolveExternalAudio(url) {
  const u = String(url || '').trim();
  if (!u) return null;
  // Direct audio?
  if (/\.(mp3|ogg|wav|m4a)(\?|#|$)/i.test(u)) return u; // <audio> can play this
  // YouTube
  if (/youtu\.be\/|youtube\.com\/watch\?v=/.test(u)) {
    const id = (u.match(/youtu\.be\/([^?&#]+)/)?.[1]) ||
               (u.match(/[?&]v=([^&#]+)/)?.[1]) || '';
    if (!id) return null;
    return `iframe:https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  }
  // SoundCloud (use oEmbed player)
  if (/soundcloud\.com\//.test(u)) {
    const enc = encodeURIComponent(u);
    return `iframe:https://w.soundcloud.com/player/?url=${enc}&auto_play=true`;
  }
  // Fallback: try as audio anyway
  return u;
}
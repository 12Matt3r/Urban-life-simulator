// ui/radio.js
import { getStations } from '../systems/radio.store.js';
import { getLatestTrackPublicUrl, resolveExternalAudio } from '../systems/db.js';

export function mountRadio(container, eventBus) {
  const stations = getStations();

  container.innerHTML = `
    <style>
      #radio-dock { background: #2a2a3e; padding: 10px; border-radius: 8px; border: 1px solid #7b52c9; width: 260px; }
      #radio-dock h5 { margin: 0 0 10px 0; text-align: center; }
      #radio-dock .stations { display: grid; grid-template-columns: 1fr; gap: 6px; max-height: 220px; overflow:auto; }
      #radio-dock button, #radio-dock input { width: 100%; padding: 6px; font-size: 12px; }
      #radio-dock p { font-size: 11px; color: #a0a0c0; margin: 6px 0 0 0; text-align: center; }
      #ext-row { display:flex; gap:6px; margin-top:8px; }
      #ext-url { flex:1; font-size: 12px; }
      #player-wrap { margin-top: 8px; }
      #player-audio { width: 100%; }
      #player-iframe { width: 100%; height: 160px; border: 0; display:none; }
      .muted { color:#a0a0c0; font-size:11px; text-align:center; margin-top:6px; }
    </style>

    <h5>Radio</h5>
    <div class="stations">
      ${stations.map(s => `<button data-station-id="${s.id}">${s.name}</button>`).join('')}
    </div>

    <div id="ext-row">
      <input id="ext-url" type="url" placeholder="Paste YouTube/SoundCloud/mp3 URL">
      <button id="ext-play">Play</button>
    </div>

    <div id="player-wrap">
      <audio id="player-audio" controls preload="none"></audio>
      <iframe id="player-iframe" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>
    </div>

    <p id="now-playing">Now Playing: Off Air</p>
    <div id="player-note" class="muted"></div>
  `;

  const nowPlayingEl = container.querySelector('#now-playing');
  const noteEl = container.querySelector('#player-note');
  const audioEl = container.querySelector('#player-audio');
  const iframeEl = container.querySelector('#player-iframe');

  function stopAll() {
    // stop audio
    try { audioEl.pause(); audioEl.src = ''; } catch {}
    // stop iframe
    iframeEl.src = 'about:blank';
    iframeEl.style.display = 'none';
    audioEl.style.display = 'block';
  }

  function playAudio(url) {
    stopAll();
    audioEl.src = url;
    audioEl.play().catch(()=>{ /* user gesture might be required */ });
    audioEl.style.display = 'block';
    noteEl.textContent = '';
  }

  function playIframe(embedUrl) {
    stopAll();
    iframeEl.src = embedUrl;
    iframeEl.style.display = 'block';
    audioEl.style.display = 'none';
    noteEl.textContent = '';
  }

  async function playStation(stationId, stationName, moods) {
    // Try to pull the latest uploaded track URL from Supabase; if none, just switch moods.
    let publicUrl = null;
    try {
      // stationId here is from local store; your DB `station_id` is UUID.
      // If you want to align IDs, you can store a mapping. For now, try anyway:
      publicUrl = await getLatestTrackPublicUrl(stationId);
    } catch {}

    if (publicUrl) {
      nowPlayingEl.textContent = `Now Playing: ${stationName}`;
      playAudio(publicUrl);
    } else {
      nowPlayingEl.textContent = `Now Playing: ${stationName} (no uploaded tracks yet)`;
      noteEl.textContent = 'Tip: switch to External and paste a YouTube/SoundCloud link, or upload via Community Radio.';
    }

    // broadcast mood change regardless of playback success
    eventBus.publish('radio.change', { stationId, moods });
  }

  // Built-in stations
  container.querySelectorAll('[data-station-id]').forEach(btn => {
    btn.onclick = async () => {
      const stationId = btn.dataset.stationId;
      const station = stations.find(s => s.id === stationId);
      if (!station) return;
      await playStation(station.id, station.name, station.moodTags || []);
    };
  });

  // External links
  container.querySelector('#ext-play').onclick = () => {
    const urlRaw = container.querySelector('#ext-url').value.trim();
    if (!urlRaw) return alert("Please paste a URL.");
    const resolved = resolveExternalAudio(urlRaw);
    if (!resolved) return alert("Unsupported URL.");

    nowPlayingEl.textContent = `Now Playing: External`;
    eventBus.publish('radio.change', { stationId: 'external', moods: ['varied'], url: urlRaw });

    if (resolved.startsWith('iframe:')) {
      playIframe(resolved.replace(/^iframe:/,''));
    } else {
      playAudio(resolved);
    }
  };
}
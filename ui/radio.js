(function(global) {
  function mountRadio(container) {
    container.innerHTML = `
      <div id="uls-radio" class="uls-radio">
        <div class="uls-radio__bezel">
          <div class="uls-radio__brand">ULS • CAR RADIO</div>
          <div class="uls-radio__display">
            <div class="uls-radio__station" id="radio-station">—</div>
            <div class="uls-radio__title" id="radio-title">Power OFF</div>
            <div class="uls-radio__time" id="radio-time">00:00 / 00:00</div>
          </div>

          <div class="uls-radio__row">
            <button id="radio-power" class="btn danger">POWER</button>
            <div class="btn-group">
              <button id="radio-prev" class="btn" disabled>⏮</button>
              <button id="radio-play" class="btn" disabled>▶</button>
              <button id="radio-pause" class="btn" disabled>⏸</button>
              <button id="radio-next" class="btn" disabled>⏭</button>
            </div>
            <label class="vol">
              VOL <input id="radio-vol" type="range" min="0" max="1" step="0.01" value="0.8">
            </label>
          </div>

          <div class="uls-radio__row">
            <div class="btn-group" id="radio-stations"></div>
          </div>
        </div>

        <audio id="radio-audio" preload="metadata" crossorigin="anonymous"></audio>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .uls-radio { width:560px; max-width:95vw; margin:10px auto; font-family:sans-serif; }
      .uls-radio__bezel { background:#1a1d22; border:2px solid #2a2f37; border-radius:14px; padding:14px; color:#dce3ee; }
      .uls-radio__brand { font-size:12px; letter-spacing:2px; opacity:.7; margin-bottom:8px; }
      .uls-radio__display { background:#0c1116; border:1px solid #29303a; border-radius:8px; padding:10px 12px; margin-bottom:10px; }
      .uls-radio__station { font-weight:700; font-size:14px; color:#89d1ff; }
      .uls-radio__title { font-size:13px; color:#cfe6ff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .uls-radio__time { font-size:12px; color:#8aa0b5; margin-top:2px; }
      .uls-radio__row { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:8px; flex-wrap:wrap; }
      .btn { background:#222833; color:#e8f1ff; border:1px solid #394455; padding:8px 12px; border-radius:8px; cursor:pointer; }
      .btn:hover:not(:disabled) { background:#2b3341; }
      .btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .btn.danger { background:#5b1a1a; border-color:#7a2323; }
      .btn-group { display:flex; gap:8px; flex-wrap:wrap; }
      .vol { display:flex; align-items:center; gap:8px; }
      .uls-radio.off { opacity:.55; filter:grayscale(.2); }
    `;
    document.head.appendChild(style);

    // --- Core Radio Logic (Rewritten for Robustness) ---
    (function () {
      const STATIONS = global.RADIO_STATIONS || {};
      const firstStationId = Object.keys(STATIONS)[0] || 'none';

      const KEY = 'uls_radio_state';
      const defaults = { power: false, station: firstStationId, index: 0, vol: 0.8, t: 0 };
      let state = Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || '{}'));

      const $ = id => document.getElementById(id);
      const elAudio = $('radio-audio'), elPower = $('radio-power'), elPlay = $('radio-play'),
            elPause = $('radio-pause'), elNext = $('radio-next'), elPrev = $('radio-prev'),
            elVol = $('radio-vol'), elStationName = $('radio-station'), elTitle = $('radio-title'),
            elTime = $('radio-time'), elStations = $('radio-stations'), root = $('uls-radio');

      const controls = [elPlay, elPause, elNext, elPrev];

      function saveState() {
        localStorage.setItem(KEY, JSON.stringify(state));
      }

      function getCurrentStation() {
        return STATIONS[state.station] || null;
      }

      function getCurrentTrack() {
        const station = getCurrentStation();
        if (!station || !station.tracks || station.tracks.length === 0) {
          return null;
        }
        return station.tracks[state.index % station.tracks.length] || null;
      }

      function guessType(u){
        if (!u) return 'audio/mpeg';
        const ext = (u.split('.').pop() || '').toLowerCase();
        if (ext === 'wav') return 'audio/wav';
        return 'audio/mpeg';
      }

      function loadAndPlay(resumeTime) {
        const track = getCurrentTrack();
        if (!track) {
          updateUI();
          return;
        }

        elAudio.src = track.url;
        elAudio.load();

        elAudio.oncanplaythrough = function() {
            elAudio.currentTime = resumeTime ? state.t : 0;
            elAudio.volume = state.vol;
            elAudio.play().catch(e => console.error("Radio play failed:", e));
            state.t = 0; // Reset time after loading
            saveState();
            updateUI();
        };

        elAudio.onerror = function() {
            console.error("Error loading track:", track.url);
            // Optionally, skip to the next track on error
            next(true);
        };
      }

      function play() {
        if (state.power && elAudio.src) {
          elAudio.play().catch(e => console.error("Radio play failed:", e));
        }
      }

      function pause() {
        elAudio.pause();
      }

      function next(isErrorSkip) {
        const station = getCurrentStation();
        if (!station || station.tracks.length === 0) return;
        state.index = (state.index + 1) % station.tracks.length;
        if (!isErrorSkip) { // Don't reset time if we're just skipping a bad track
             state.t = 0;
        }
        saveState();
        if (state.power) loadAndPlay(false);
      }

      function prev() {
        const station = getCurrentStation();
        if (!station || station.tracks.length === 0) return;
        state.index = (state.index - 1 + station.tracks.length) % station.tracks.length;
        state.t = 0;
        saveState();
        if (state.power) loadAndPlay(false);
      }

      function setStation(id) {
        if (!STATIONS[id]) return;
        state.station = id;
        state.index = 0;
        state.t = 0;
        saveState();
        updateUI();
        if (state.power) {
          loadAndPlay(false);
        }
      }

      function setVolume(v) {
        state.vol = Math.max(0, Math.min(1, v));
        elAudio.volume = state.vol;
        saveState();
      }

      function togglePower() {
        state.power = !state.power;
        if (state.power) {
          loadAndPlay(true); // Resume from saved time
        } else {
          state.t = elAudio.currentTime; // Save time before pausing
          elAudio.pause();
          elAudio.src = ''; // Unload the track
        }
        saveState();
        updateUI();
      }

      function fmt(s) {
        s = Math.floor(s || 0);
        const m = String(Math.floor(s / 60)).padStart(2, '0');
        const ss = String(s % 60).padStart(2, '0');
        return m + ':' + ss;
      }

      function updateUI() {
        root.classList.toggle('off', !state.power);
        elVol.value = String(state.vol);
        controls.forEach(btn => btn.disabled = !state.power);

        if (!state.power) {
          elStationName.textContent = '—';
          elTitle.textContent = 'Power OFF';
          elTime.textContent = '00:00 / 00:00';
          return;
        }

        const station = getCurrentStation();
        const track = getCurrentTrack();
        elStationName.textContent = station ? station.name.toUpperCase() : 'NO STATION';
        elTitle.textContent = track ? track.title : 'No track available';
        const dur = isFinite(elAudio.duration) ? elAudio.duration : 0;
        elTime.textContent = fmt(elAudio.currentTime) + ' / ' + fmt(dur);
      }

      // --- Event Listeners ---
      elPower.onclick = togglePower;
      elPlay.onclick = play;
      elPause.onclick = pause;
      elNext.onclick = () => next(false);
      elPrev.onclick = prev;
      elVol.oninput = e => setVolume(parseFloat(e.target.value));
      elAudio.addEventListener('ended', () => next(false));
      elAudio.addEventListener('timeupdate', updateUI);
      elAudio.addEventListener('pause', updateUI);
      elAudio.addEventListener('play', updateUI);

      // --- Initialization ---
      elStations.innerHTML = '';
      Object.keys(STATIONS).forEach(id => {
        const station = STATIONS[id];
        const b = document.createElement('button');
        b.className = 'btn';
        b.textContent = station.name;
        b.onclick = () => setStation(id);
        elStations.appendChild(b);
      });

      // Set initial state without auto-playing
      updateUI();
      if(state.power && getCurrentTrack()){
        // If powered on, load media but don't auto-play until user interacts
        elAudio.src = getCurrentTrack().url;
      }

      global.ULSRadio = { STATIONS, togglePower, play, pause, next, prev, setStation, setVolume, mute: (on) => { elAudio.muted = !!on; } };
      console.log('Radio logic initialized with ' + Object.keys(STATIONS).length + ' stations.');

    })();
  }

  global.UI = global.UI || {};
  global.UI.Radio = { mount: mountRadio };

})(window);
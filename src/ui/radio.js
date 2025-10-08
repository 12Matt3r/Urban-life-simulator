// src/ui/radio.js

function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmtTime(s) {
  s = Math.floor(s || 0);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

export function createRadio(root, stations = {}) {
  const radioHTML = `
    <div id="uls-radio" class="off">
      <audio id="radio-audio" crossOrigin="anonymous"></audio>
      <div class="radio-display" style="padding: 5px; text-align: center;">
        <div id="radio-station" style="font-weight: bold;"></div>
        <div id="radio-title" style="font-style: italic;"></div>
        <div id="radio-time" style="font-size: 0.9em; color: #ccc;"></div>
      </div>
      <div class="radio-controls" style="display: flex; justify-content: center; gap: 5px; padding: 5px;">
        <button id="radio-power">PWR</button>
        <button id="radio-prev">PREV</button>
        <button id="radio-play">PLAY</button>
        <button id="radio-pause">PAUSE</button>
        <button id="radio-next">NEXT</button>
        <button id="radio-shuffle">SHFL</button>
      </div>
      <div class="radio-volume" style="padding: 5px;">
        <input type="range" id="radio-vol" min="0" max="1" step="0.01" style="width: 100%;" />
      </div>
      <div id="radio-stations" class="radio-station-list" style="display: flex; flex-wrap: wrap; gap: 5px; padding: 5px; justify-content: center;"></div>
    </div>
  `;

  const container = document.createElement('div');
  container.id = 'radio-container-wrapper';
  container.innerHTML = radioHTML;
  root.appendChild(container);

  const el = {
    root: container.querySelector('#uls-radio'),
    audio: container.querySelector('#radio-audio'),
    power: container.querySelector('#radio-power'),
    play: container.querySelector('#radio-play'),
    pause: container.querySelector('#radio-pause'),
    next: container.querySelector('#radio-next'),
    prev: container.querySelector('#radio-prev'),
    shuffle: container.querySelector('#radio-shuffle'),
    vol: container.querySelector('#radio-vol'),
    stationName: container.querySelector('#radio-station'),
    title: container.querySelector('#radio-title'),
    time: container.querySelector('#radio-time'),
    stations: container.querySelector('#radio-stations'),
  };

  const firstStationId = Object.keys(stations)[0] || 'none';
  const defaults = { power: false, station: firstStationId, index: 0, vol: 0.8, t: 0, shuffle: false };
  let state = { ...defaults, ...JSON.parse(localStorage.getItem('uls_radio_state') || '{}') };

  let activePlaylist = [];

  function saveState() {
    localStorage.setItem('uls_radio_state', JSON.stringify(state));
  }

  function updateActivePlaylist() {
    const station = stations[state.station];
    if (!station || !station.tracks || station.tracks.length === 0) {
      activePlaylist = [];
      return;
    }
    if (state.shuffle) {
      if (!station._shuffled) {
        station._shuffled = shuffleArray([...station.tracks]);
      }
      activePlaylist = station._shuffled;
    } else {
      activePlaylist = station.tracks;
    }
  }

  function getCurrentTrack() {
    if (activePlaylist.length === 0) return null;
    return activePlaylist[state.index % activePlaylist.length];
  }

  function loadAndPlay(resumeTime) {
    const track = getCurrentTrack();
    if (!track) return updateUI();
    el.audio.src = track.url;
    el.audio.load();
    const playPromise = el.audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        el.audio.currentTime = resumeTime ? state.t : 0;
        el.audio.volume = state.vol;
        state.t = 0;
        saveState();
        updateUI();
      }).catch(e => console.error("Radio play failed:", e));
    }
    el.audio.onerror = () => next(true);
  }

  function play() { if (state.power && el.audio.src) el.audio.play(); }
  function pause() { el.audio.pause(); }

  function next(isError = false) {
    if (activePlaylist.length === 0) return;
    state.index = (state.index + 1) % activePlaylist.length;
    if (!isError) state.t = 0;
    saveState();
    if (state.power) loadAndPlay(false);
  }

  function prev() {
    if (activePlaylist.length === 0) return;
    state.index = (state.index - 1 + activePlaylist.length) % activePlaylist.length;
    state.t = 0;
    saveState();
    if (state.power) loadAndPlay(false);
  }

  function togglePower() {
    state.power = !state.power;
    if (state.power) {
      updateActivePlaylist();
      loadAndPlay(true);
    } else {
      state.t = el.audio.currentTime;
      pause();
      el.audio.src = '';
    }
    saveState();
    updateUI();
  }

  function toggleShuffle() {
    if (!state.power) return;
    const currentTrackUrl = getCurrentTrack()?.url;
    state.shuffle = !state.shuffle;
    Object.values(stations).forEach(s => delete s._shuffled);
    updateActivePlaylist();
    if (currentTrackUrl) {
      const newIndex = activePlaylist.findIndex(t => t.url === currentTrackUrl);
      state.index = newIndex !== -1 ? newIndex : 0;
    } else {
      state.index = 0;
    }
    saveState();
    updateUI();
  }

  function setStation(id) {
    state.station = id;
    state.index = 0;
    state.t = 0;
    Object.values(stations).forEach(s => delete s._shuffled);
    updateActivePlaylist();
    saveState();
    updateUI();
    if (state.power) loadAndPlay(false);
  }

  function setVolume(v) {
    state.vol = v;
    el.audio.volume = v;
    saveState();
  }

  function updateUI() {
    el.root.classList.toggle('off', !state.power);
    el.vol.value = state.vol;
    [el.play, el.pause, el.next, el.prev, el.shuffle].forEach(btn => { btn.disabled = !state.power; });
    el.shuffle.classList.toggle('active', state.shuffle);

    if (!state.power) {
      el.stationName.textContent = '—';
      el.title.textContent = 'Power OFF';
      el.time.textContent = '00:00 / 00:00';
      return;
    }
    const station = stations[state.station] || {};
    const track = getCurrentTrack();
    el.stationName.textContent = station.name || 'NO STATION';
    el.title.textContent = track ? track.title : 'No Track';
    const dur = isFinite(el.audio.duration) ? el.audio.duration : 0;
    el.time.textContent = fmtTime(el.audio.currentTime) + ' / ' + fmtTime(dur);
  }

  function renderStationButtons() {
    el.stations.innerHTML = '';
    Object.values(stations).forEach(station => {
      const b = document.createElement('button');
      b.textContent = station.name;
      b.onclick = () => setStation(station.id);
      el.stations.appendChild(b);
    });
  }

  function bindEvents() {
    el.power.onclick = togglePower;
    el.play.onclick = play;
    el.pause.onclick = pause;
    el.next.onclick = () => next(false);
    el.prev.onclick = prev;
    el.shuffle.onclick = toggleShuffle;
    el.vol.oninput = (e) => setVolume(parseFloat(e.target.value));
    el.audio.addEventListener('ended', () => next(false));
    el.audio.addEventListener('timeupdate', updateUI);
  }

  bindEvents();
  renderStationButtons();
  updateActivePlaylist();
  updateUI();

  if (state.power && getCurrentTrack()) {
    el.audio.src = getCurrentTrack().url;
  }

  function destroy() {
    container.remove();
  }

  return { el: el.root, destroy };
}
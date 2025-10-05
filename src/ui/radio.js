'use strict';

const RADIO_HTML = `
  <div id="uls-radio" class="off">
    <audio id="radio-audio"></audio>
    <div class="radio-header">
      <span id="radio-station">—</span>
      <span id="radio-title">Power OFF</span>
    </div>
    <div class="radio-controls">
      <button id="radio-power">PWR</button>
      <button id="radio-prev" disabled>PREV</button>
      <button id="radio-play" disabled>PLAY</button>
      <button id="radio-pause" disabled>PAUSE</button>
      <button id="radio-next" disabled>NEXT</button>
      <button id="radio-shuffle" disabled>SHFL</button>
    </div>
    <div class="radio-footer">
      <input type="range" id="radio-vol" min="0" max="1" step="0.05" value="0.8">
      <span id="radio-time">00:00 / 00:00</span>
    </div>
    <div id="radio-stations" class="radio-station-list"></div>
  </div>
`;

export const ULSRadio = {
  stations: {},
  state: {},
  activePlaylist: [],
  el: {},

  mount: function(container) {
    container.innerHTML = RADIO_HTML;
  },

  init: function(config) {
    this.stations = config.stations || {};
    const firstStationId = Object.keys(this.stations)[0] || 'none';
    const defaults = { power: false, station: firstStationId, index: 0, vol: 0.8, t: 0, shuffle: false };
    this.state = { ...defaults, ...JSON.parse(localStorage.getItem('uls_radio_state') || '{}') };

    this.el = {
      audio: document.getElementById('radio-audio'),
      power: document.getElementById('radio-power'),
      play: document.getElementById('radio-play'),
      pause: document.getElementById('radio-pause'),
      next: document.getElementById('radio-next'),
      prev: document.getElementById('radio-prev'),
      shuffle: document.getElementById('radio-shuffle'),
      vol: document.getElementById('radio-vol'),
      stationName: document.getElementById('radio-station'),
      title: document.getElementById('radio-title'),
      time: document.getElementById('radio-time'),
      stations: document.getElementById('radio-stations'),
      root: document.getElementById('uls-radio'),
    };

    this.bindEvents();
    this.renderStationButtons();
    this.updateActivePlaylist();
    this.updateUI();

    if (this.state.power && this.getCurrentTrack()) {
      this.el.audio.src = this.getCurrentTrack().url;
    }
    console.log('Radio module initialized.');
  },

  bindEvents: function() {
    this.el.power.onclick = () => this.togglePower();
    this.el.play.onclick = () => this.play();
    this.el.pause.onclick = () => this.pause();
    this.el.next.onclick = () => this.next(false);
    this.el.prev.onclick = () => this.prev();
    this.el.shuffle.onclick = () => this.toggleShuffle();
    this.el.vol.oninput = (e) => this.setVolume(parseFloat(e.target.value));
    this.el.audio.addEventListener('ended', () => this.next(false));
    this.el.audio.addEventListener('timeupdate', () => this.updateUI());
  },

  saveState: function() {
    localStorage.setItem('uls_radio_state', JSON.stringify(this.state));
  },

  updateActivePlaylist: function() {
    const station = this.stations[this.state.station];
    if (!station || !station.urls || station.urls.length === 0) {
      this.activePlaylist = [];
      return;
    }
    // The original `tracks` property was `urls`, based on assets.json
    if (this.state.shuffle) {
      if (!station._shuffled) {
        station._shuffled = this.shuffleArray([...station.urls]);
      }
      this.activePlaylist = station._shuffled.map(url => ({ url, title: this.extractTitle(url) }));
    } else {
      this.activePlaylist = station.urls.map(url => ({ url, title: this.extractTitle(url) }));
    }
  },

  getCurrentTrack: function() {
    if (this.activePlaylist.length === 0) return null;
    return this.activePlaylist[this.state.index % this.activePlaylist.length];
  },

  loadAndPlay: function(resumeTime) {
    const track = this.getCurrentTrack();
    if (!track) return this.updateUI();
    this.el.audio.src = track.url;
    this.el.audio.load();
    this.el.audio.oncanplaythrough = () => {
      this.el.audio.currentTime = resumeTime ? this.state.t : 0;
      this.el.audio.volume = this.state.vol;
      this.el.audio.play().catch(e => console.error("Radio play failed:", e));
      this.state.t = 0;
      this.saveState();
      this.updateUI();
    };
  },

  play: function() { if (this.state.power && this.el.audio.src) this.el.audio.play(); },
  pause: function() { this.el.audio.pause(); },

  next: function(isError) {
    if (this.activePlaylist.length === 0) return;
    this.state.index = (this.state.index + 1) % this.activePlaylist.length;
    if (!isError) this.state.t = 0;
    this.saveState();
    if (this.state.power) this.loadAndPlay(false);
  },

  prev: function() {
    if (this.activePlaylist.length === 0) return;
    this.state.index = (this.state.index - 1 + this.activePlaylist.length) % this.activePlaylist.length;
    this.state.t = 0;
    this.saveState();
    if (this.state.power) this.loadAndPlay(false);
  },

  togglePower: function() {
    this.state.power = !this.state.power;
    if (this.state.power) {
      this.updateActivePlaylist();
      this.loadAndPlay(true);
    } else {
      this.state.t = this.el.audio.currentTime;
      this.el.audio.pause();
      this.el.audio.src = '';
    }
    this.saveState();
    this.updateUI();
  },

  toggleShuffle: function() {
      if (!this.state.power) return;
      const currentTrackUrl = this.getCurrentTrack() ? this.getCurrentTrack().url : null;
      this.state.shuffle = !this.state.shuffle;

      const station = this.stations[this.state.station];
      if (station && station._shuffled) delete station._shuffled;

      this.updateActivePlaylist();

      if (currentTrackUrl) {
          const newIndex = this.activePlaylist.findIndex(t => t.url === currentTrackUrl);
          this.state.index = newIndex !== -1 ? newIndex : 0;
      } else {
          this.state.index = 0;
      }
      this.saveState();
      this.updateUI();
  },

  setStation: function(id) {
    this.state.station = id;
    this.state.index = 0;
    this.state.t = 0;
    this.updateActivePlaylist();
    this.saveState();
    this.updateUI();
    if (this.state.power) this.loadAndPlay(false);
  },

  setVolume: function(v) {
      this.state.vol = v;
      this.el.audio.volume = v;
      this.saveState();
  },

  updateUI: function() {
    this.el.root.classList.toggle('off', !this.state.power);
    this.el.vol.value = this.state.vol;
    [this.el.play, this.el.pause, this.el.next, this.el.prev, this.el.shuffle].forEach(btn => btn.disabled = !this.state.power);
    this.el.shuffle.classList.toggle('active', this.state.shuffle);

    if (!this.state.power) {
      this.el.stationName.textContent = '—';
      this.el.title.textContent = 'Power OFF';
      this.el.time.textContent = '00:00 / 00:00';
      return;
    }
    const station = this.stations[this.state.station] || {};
    const track = this.getCurrentTrack();
    this.el.stationName.textContent = station.name || 'NO STATION';
    this.el.title.textContent = track ? track.title : 'No Track';
    const dur = isFinite(this.el.audio.duration) ? this.el.audio.duration : 0;
    this.el.time.textContent = this.fmt(this.el.audio.currentTime) + ' / ' + this.fmt(dur);
  },

  renderStationButtons: function() {
    this.el.stations.innerHTML = '';
    Object.values(this.stations).forEach(station => {
      const b = document.createElement('button');
      b.className = 'uls-dev-btn'; // Re-using a class for styling
      b.textContent = station.name;
      b.onclick = () => this.setStation(station.id);
      this.el.stations.appendChild(b);
    });
  },

  extractTitle: (url) => decodeURIComponent(url.split('/').pop().replace(/\.\w+$/, '')),
  shuffleArray: (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  fmt: (s) => { s=Math.floor(s||0); return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0'); }
};
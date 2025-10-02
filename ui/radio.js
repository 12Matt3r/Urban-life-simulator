(function(global) {
  'use strict';

  const ULSRadio = {
    state: {},
    activePlaylist: [],
    el: {},

    mount: function(container) {
      container.innerHTML = `
        <div id="uls-radio" class="card">
            <audio id="radio-audio"></audio>
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <h2 style="font-size: 16px; margin: 0;">ULS Radio</h2>
                <div id="radio-station" style="font-style: italic; color: var(--muted);">—</div>
            </div>
            <div id="radio-title" style="margin: 12px 0; text-align: center; font-size: 14px; min-height: 1.5em;">Power OFF</div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button id="radio-power" class="uls-dev-btn">PWR</button>
                <button id="radio-prev" class="uls-dev-btn">◀</button>
                <button id="radio-play" class="uls-dev-btn">▶</button>
                <button id="radio-pause" class="uls-dev-btn">❚❚</button>
                <button id="radio-next" class="uls-dev-btn">▶</button>
                <button id="radio-shuffle" class="uls-dev-btn">SHFL</button>
                <input type="range" id="radio-vol" min="0" max="1" step="0.05" style="flex-grow: 1;">
            </div>
            <div id="radio-time" style="text-align: center; margin-top: 8px; font-size: 12px; color: var(--muted);">00:00 / 00:00</div>
            <div id="radio-stations" style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px;"></div>
        </div>
      `;
    },

    init: function() {
      const firstStationId = Object.keys(global.RADIO_STATIONS || {})[0] || 'none';
      const defaults = { power: false, station: firstStationId, index: 0, vol: 0.8, t: 0, shuffle: false };
      this.state = Object.assign({}, defaults, JSON.parse(localStorage.getItem('uls_radio_state') || '{}'));

      this.el.audio = document.getElementById('radio-audio');
      this.el.power = document.getElementById('radio-power');
      this.el.play = document.getElementById('radio-play');
      this.el.pause = document.getElementById('radio-pause');
      this.el.next = document.getElementById('radio-next');
      this.el.prev = document.getElementById('radio-prev');
      this.el.shuffle = document.getElementById('radio-shuffle');
      this.el.vol = document.getElementById('radio-vol');
      this.el.stationName = document.getElementById('radio-station');
      this.el.title = document.getElementById('radio-title');
      this.el.time = document.getElementById('radio-time');
      this.el.stations = document.getElementById('radio-stations');
      this.el.root = document.getElementById('uls-radio');

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
      this.el.power.onclick = this.togglePower.bind(this);
      this.el.play.onclick = this.play.bind(this);
      this.el.pause.onclick = this.pause.bind(this);
      this.el.next.onclick = this.next.bind(this, false);
      this.el.prev.onclick = this.prev.bind(this);
      this.el.shuffle.onclick = this.toggleShuffle.bind(this);
      this.el.vol.oninput = (e) => this.setVolume(parseFloat(e.target.value));
      this.el.audio.addEventListener('ended', () => this.next(false));
      this.el.audio.addEventListener('timeupdate', this.updateUI.bind(this));
    },

    saveState: function() {
      localStorage.setItem('uls_radio_state', JSON.stringify(this.state));
    },

    updateActivePlaylist: function() {
      const station = global.RADIO_STATIONS[this.state.station];
      if (!station || !station.tracks || station.tracks.length === 0) {
        this.activePlaylist = [];
        return;
      }
      if (this.state.shuffle) {
        if (!station._shuffled) {
          station._shuffled = this.shuffleArray(station.tracks);
        }
        this.activePlaylist = station._shuffled;
      } else {
        this.activePlaylist = station.tracks;
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

        const station = global.RADIO_STATIONS[this.state.station];
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
      const station = global.RADIO_STATIONS[this.state.station] || {};
      const track = this.getCurrentTrack();
      this.el.stationName.textContent = station.name || 'NO STATION';
      this.el.title.textContent = track ? track.title : 'No Track';
      const dur = isFinite(this.el.audio.duration) ? this.el.audio.duration : 0;
      this.el.time.textContent = this.fmt(this.el.audio.currentTime) + ' / ' + this.fmt(dur);
    },

    renderStationButtons: function() {
      this.el.stations.innerHTML = '';
      Object.values(global.RADIO_STATIONS).forEach(station => {
        const b = document.createElement('button');
        b.className = 'uls-dev-btn';
        b.textContent = station.name;
        b.onclick = () => this.setStation(station.id);
        this.el.stations.appendChild(b);
      });
    },

    shuffleArray: function(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    fmt: function(s) { s=Math.floor(s||0); return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0'); }
  };

  global.UI = global.UI || {};
  global.UI.Radio = ULSRadio;

})(window);
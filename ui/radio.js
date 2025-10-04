(function(global) {
  'use strict';

  const ULSRadio = {
    state: {},
    activePlaylist: [],
    el: {},

    init: function() {
      const firstStationId = Object.keys(global.RADIO_STATIONS || {})[0] || 'none';
      const defaults = { power: false, station: firstStationId, index: 0, vol: 0.8, t: 0, shuffle: false };
      let state = Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || '{}'));

      const $ = id => document.getElementById(id);
      const elAudio = $('radio-audio'), elPower = $('radio-power'), elPlay = $('radio-play'),
            elPause = $('radio-pause'), elNext = $('radio-next'), elPrev = $('radio-prev'),
            elShuffle = $('radio-shuffle'), elVol = $('radio-vol'), elStationName = $('radio-station'),
            elTitle = $('radio-title'), elTime = $('radio-time'), elStations = $('radio-stations'),
            root = $('uls-radio');

      const controls = [elPlay, elPause, elNext, elPrev, elShuffle];
      let activePlaylist = [];

      function saveState() {
        localStorage.setItem(KEY, JSON.stringify(state));
      }

      function shuffleArray(array) {
        var a = array.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = a[i];
            a[i] = a[j];
            a[j] = temp;
        }
        return a;
      }

      function updateActivePlaylist() {
        const station = STATIONS[state.station] || null;
        if (!station || !station.tracks || station.tracks.length === 0) {
          activePlaylist = [];
          return;
        }
        if (state.shuffle) {
          if (!station._shuffled) {
            station._shuffled = shuffleArray(station.tracks);
          }
          activePlaylist = station._shuffled;
        } else {
          activePlaylist = station.tracks;
          if (station._shuffled) {
            delete station._shuffled;
          }
        }
      }

      function getCurrentTrack() {
        if (!activePlaylist || activePlaylist.length === 0) return null;
        return activePlaylist[state.index % activePlaylist.length] || null;
      }

      function guessType(u) {
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
        elAudio.onloadeddata = function() {
            elAudio.currentTime = resumeTime ? state.t : 0;
            elAudio.volume = state.vol;
            elAudio.play().catch(e => console.error("Radio play failed on load:", e));
            state.t = 0;
            saveState();
            updateUI();
        };
        elAudio.onerror = function() {
            console.error("Error loading track:", track.url);
            next(true);
        };
      }

      function play() {
        if (!state.power || !elAudio.src) return;
        // If audio is not in a playable state, reload it.
        if (elAudio.readyState === 0 && getCurrentTrack()) {
          console.warn("Audio not ready. Attempting to reload track.");
          loadAndPlay(false);
          return;
        }
        const promise = elAudio.play();
        if (promise !== undefined) {
          promise.catch(e => {
            console.error("Radio play failed:", e);
            // If play fails, it might be due to a deeper issue. Try a full reload.
            if (e.name === 'NotAllowedError') {
               console.error("Autoplay was prevented. User interaction is required.");
            } else {
               loadAndPlay(false);
            }
          });
        }
      }

      function pause() { elAudio.pause(); }

      function next(isErrorSkip) {
        if (activePlaylist.length === 0) return;
        state.index = (state.index + 1) % activePlaylist.length;
        if (!isErrorSkip) state.t = 0;
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

      function toggleShuffle() {
        if (!state.power) return;
        var currentTrackUrl = getCurrentTrack() ? getCurrentTrack().url : null;
        state.shuffle = !state.shuffle;

        var station = STATIONS[state.station] || null;
        if (station && station._shuffled) {
            delete station._shuffled;
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

      updateActivePlaylist();
      updateUI();
      if (state.power) {
        loadAndPlay(true);
      }

      global.ULSRadio = { STATIONS, togglePower, play, pause, next, prev, setStation, setVolume, mute: (on) => { elAudio.muted = !!on; }, toggleShuffle };
      console.log('Radio logic initialized with ' + Object.keys(STATIONS).length + ' stations.');
    })();
  }
    shuffleArray: function(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    fmt: function(s) { s=Math.floor(s||0); return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0'); }
  };

  global.UI = global.UI || {};
  global.UI.Radio = ULSRadio;

})(window);
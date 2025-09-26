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
              <button id="radio-prev" class="btn">⏮</button>
              <button id="radio-play" class="btn">▶</button>
              <button id="radio-pause" class="btn">⏸</button>
              <button id="radio-next" class="btn">⏭</button>
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
      .btn:hover { background:#2b3341; }
      .btn.danger { background:#5b1a1a; border-color:#7a2323; }
      .btn-group { display:flex; gap:8px; flex-wrap:wrap; }
      .vol { display:flex; align-items:center; gap:8px; }
      .uls-radio.off { opacity:.55; filter:grayscale(.2); }
    `;
    document.head.appendChild(style);

    // --- Core Radio Logic ---
    (function () {
      const KEY = 'uls_radio_state';
      const def = { power:false, station:'latin', index:0, vol:0.8, t:0 };
      let state = Object.assign({}, def, JSON.parse(localStorage.getItem(KEY)||'{}'));
      const save = ()=>localStorage.setItem(KEY, JSON.stringify(state));

      const $ = id => document.getElementById(id);
      const elAudio=$('radio-audio'), elPower=$('radio-power'), elPlay=$('radio-play'),
            elPause=$('radio-pause'), elNext=$('radio-next'), elPrev=$('radio-prev'),
            elVol=$('radio-vol'), elStationName=$('radio-station'), elTitle=$('radio-title'),
            elTime=$('radio-time'), elStations=$('radio-stations'), root=$('uls-radio');

      function guessType(u){const ext=(u.split('.').pop()||'').toLowerCase();
        return ext==='mp3'?'audio/mpeg':ext==='wav'?'audio/wav':'audio/mpeg';}

      // STATIONS: Loaded from data/radio_stations.js
      const STATIONS = global.RADIO_STATIONS || {
        latin: { id:'latin', name:'LATIN', tracks: [] },
        dubstep: { id:'dubstep', name:'DUBSTEP', tracks: [] }
      };

      function currentTrack(){ const st=STATIONS[state.station]; return st?st.tracks[state.index%st.tracks.length]:null; }
      function setStation(id){ if(!STATIONS[id])return; state.station=id; state.index=0; state.t = 0; save(); updateUI(); if(state.power)loadAndPlay(); }
      function loadAndPlay(){ const tr=currentTrack(); if(!tr)return;
        elAudio.innerHTML=''; const src=document.createElement('source'); src.src=tr.url; src.type=guessType(tr.url);
        elAudio.appendChild(src); elAudio.load(); elAudio.currentTime=state.t||0; elAudio.volume=state.vol;
        elAudio.play().catch(()=>{}); state.t=0; save(); updateUI(); }
      function play(){ if(state.power) elAudio.play().catch(()=>{}); }
      function pause(){ elAudio.pause(); }
      function next(){ if(!STATIONS[state.station] || STATIONS[state.station].tracks.length === 0) return; state.index=(state.index+1)%STATIONS[state.station].tracks.length; state.t = 0; save(); loadAndPlay(); }
      function prev(){ if(!STATIONS[state.station] || STATIONS[state.station].tracks.length === 0) return; state.index=(state.index-1+STATIONS[state.station].tracks.length)%STATIONS[state.station].tracks.length; state.t = 0; save(); loadAndPlay(); }
      function setVolume(v){ state.vol=Math.max(0,Math.min(1,v)); elAudio.volume=state.vol; save(); }
      function power(on){ state.power=(on!==undefined)?!!on:!state.power; save();
        root.classList.toggle('off',!state.power);
        if(state.power){ if(elAudio.src) { play(); } else { loadAndPlay(); } } else {state.t=elAudio.currentTime; save(); elAudio.pause(); updateUI();}}
      function fmt(s){s=Math.floor(s||0); const m=String(Math.floor(s/60)).padStart(2,'0'); const ss=String(s%60).padStart(2,'0'); return `${m}:${ss}`;}

      elPower.onclick=()=>power(); elPlay.onclick=()=>play(); elPause.onclick=()=>pause(); elNext.onclick=()=>next(); elPrev.onclick=()=>prev(); elVol.oninput=e=>setVolume(parseFloat(e.target.value));
      elAudio.addEventListener('ended', next);
      elAudio.addEventListener('timeupdate', ()=>{ if(!elAudio.paused){ const dur=isFinite(elAudio.duration)?elAudio.duration:0; elTime.textContent=`${fmt(elAudio.currentTime)} / ${fmt(dur)}`;}});

      function updateUI(){ elVol.value=String(state.vol); if(!state.power){elStationName.textContent='—'; elTitle.textContent='Power OFF'; elTime.textContent='00:00 / 00:00';return;}
        const st=STATIONS[state.station], tr=currentTrack()||{title:'—'}; elStationName.textContent=st?st.name:'—'; elTitle.textContent=tr.title; }

      Object.keys(STATIONS).forEach(id=>{const st=STATIONS[id]; const b=document.createElement('button'); b.className='btn'; b.textContent=st.name; b.onclick=()=>setStation(st.id); elStations.appendChild(b);});

      window.ULSRadio={ STATIONS, power, play, pause, next, prev, setStation, setVolume, mute:(on)=>{elAudio.muted=!!on;} };

      // Initial state
      updateUI();
      root.classList.toggle('off',!state.power);
      if(state.power) {
          const tr = currentTrack();
          if (tr) {
              const src=document.createElement('source'); src.src=tr.url; src.type=guessType(tr.url);
              elAudio.appendChild(src);
              elAudio.load();
              elAudio.currentTime = state.t || 0;
              elAudio.volume = state.vol;
              updateUI();
          }
      }
    })();
  }

  global.UI = global.UI || {};
  global.UI.Radio = { mount: mountRadio };

})(window);
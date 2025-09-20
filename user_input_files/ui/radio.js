import { getStations } from '../systems/radio.store.js';

export function mountRadio(container, eventBus){
  container.innerHTML = `
    <style>
      #radio-dock { background:#2a2a3e; padding:10px; border-radius:8px; border:1px solid #7b52c9; min-width:220px }
      #radio-dock h5 { margin:0 0 10px 0; text-align:center; }
      #radio-dock .stations { display:flex; flex-direction:column; gap:6px; max-height:240px; overflow:auto; }
      #radio-dock button.station { width:100%; padding:6px; font-size:12px; border-radius:8px; border:1px solid #7b52c9; background:#1f1f30; color:#e0e0e0; cursor:pointer }
      #radio-dock button.station.active { background:#7b52c9; color:#0f0f18; border-color:#a387e6 }
      #radio-dock .now { font-size:11px; color:#a0a0c0; margin:8px 0 0; text-align:center }
      #radio-dock .moods { font-size:10px; color:#c9c9e6; margin:2px 0 0; text-align:center; opacity:.85 }
    </style>
    <div id="radio-dock" role="region" aria-label="Radio">
      <h5>Radio</h5>
      <div class="stations" aria-live="polite"></div>
      <p class="now">Now Playing: Off Air</p>
      <p class="moods"></p>
    </div>`;
  const root=container.querySelector('#radio-dock');
  const listEl=root.querySelector('.stations');
  const nowEl=root.querySelector('.now');
  const moodsEl=root.querySelector('.moods');
  let current=null;

  function moods(st){ return Array.isArray(st?.moods)?st.moods:(st?.moodTags||[]); }

  function render(){
    const stations = getStations();
    listEl.innerHTML = stations.map(s=>`<button class="station${s.id===current?' active':''}" data-id="${s.id}">${s.name}</button>`).join('')
      || `<div style="font-size:12px;color:#a0a0c0;text-align:center">No stations</div>`;
    listEl.querySelectorAll('button.station').forEach(btn=>{
      btn.onclick=()=>select(btn.dataset.id);
    });
    if(!current && stations.length) select(stations[0].id, true);
  }

  function select(id, silent=false){
    const s = getStations().find(x=>x.id===id);
    if(!s) return;
    current = s.id;
    listEl.querySelectorAll('button.station').forEach(b=>b.classList.toggle('active', b.dataset.id===id));
    nowEl.textContent = `Now Playing: ${s.name}`;
    const m = moods(s);
    moodsEl.textContent = m.length ? `Moods: ${m.join(', ')}` : '';
    if(!silent){
      eventBus.publish('radio.change', { stationId: s.id, moods: m });
      eventBus.publish('simlog.push', { text: `Radio → ${s.name} (${m.join('/')||'—'})` });
    }
  }

  eventBus.subscribe('radio.store.updated', render);
  render();
}
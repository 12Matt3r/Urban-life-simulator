// ui/hud.js
import { mountShopModal } from './shop.js';

export function mountHUD(container, character, eventBus){
  container.innerHTML = `
    <style>
      .hud { display:flex; flex-direction:column; gap:10px; background:#2a2a3e; padding:10px; border-radius:8px; margin-bottom:20px; border:1px solid #7b52c9; }
      .hud-top { display:flex; justify-content:space-between; align-items:center; gap:10px; }
      .hud-char-info { font-size:1.1rem; }
      .hud-stats { display:flex; gap:12px; flex-wrap:wrap; }
      .hud-stat { text-align:center; min-width:52px; }
      .hud-stat span { font-size:.75rem; color:#a0a0c0; }
      .hud-actions { display:flex; gap:8px; flex-wrap:wrap; }
      .hud-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
      .chipline { display:flex; gap:6px; flex-wrap:wrap; }
      .chip { padding:4px 8px; border:1px solid #3a3a5e; border-radius:999px; background:#1a1a2e; font-size:12px; color:#e0e0e0; }
      .hud-kv { font-size:.9rem; color:#c9c9e6; }
      .hud-kv strong { color:#e0e0ff; }
      .hud small.muted { color:#a0a0c0; }
    </style>

    <div class="hud">
      <div class="hud-top">
        <div class="hud-char-info"><strong id="hud-name">${character.name}</strong></div>
        <div id="hud-stats" class="hud-stats">
          ${Object.entries(character.stats).map(([k,v])=>`
            <div class="hud-stat" id="hud-stat-${k}">
              <span>${k.slice(0,3).toUpperCase()}</span><br/>
              <strong>${v}</strong>
            </div>`).join('')}
        </div>
        <div class="hud-actions">
          <button id="hud-save">Save</button>
          <button id="hud-load">Load</button>
          <button id="hud-export">Export</button>
          <button id="hud-community">Community</button>
          <button id="hud-glasshouse">Glass House</button>
          <button id="hud-careerlog">Career Log</button>
          <button id="hud-shop">Shop</button>
        </div>
      </div>

      <div id="hud-extra" style="font-size:12px;color:#a0a0c0;display:flex;gap:12px;margin-top:4px;">
        <span id="hud-time">🕒 --:--</span>
        <span id="hud-weather">☀️ --</span>
      </div>

      <div class="hud-row">
        <div class="hud-kv">District: <strong id="hud-district">${character.district || '—'}</strong></div>
        <button id="hud-district-change" title="Change district">Change</button>
        <small class="muted">Tip: your choices can also trigger moves.</small>
      </div>

      <div>
        <div class="hud-kv" style="margin-bottom:4px;">Career:</div>
        <div id="hud-roles" class="chipline">
          ${(character.roleTags||[]).map(tag => `<span class="chip">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
    </div>
  `;

  const statsContainer = container.querySelector('#hud-stats');
  const districtEl = container.querySelector('#hud-district');
  const rolesEl = container.querySelector('#hud-roles');

  eventBus.subscribe('character.stats.updated', (char)=>{
    Object.entries(char.stats).forEach(([k,v])=>{
      const el = statsContainer.querySelector(`#hud-stat-${k} strong`);
      if (el) el.textContent = v;
    });
  });

  eventBus.subscribe('career.tags.updated', (tags = [])=>{
    rolesEl.innerHTML = tags.map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('');
  });

  eventBus.subscribe('district.changed', (name)=>{
    districtEl.textContent = name || '—';
  });

  container.querySelector('#hud-save').onclick = () => eventBus.publish('persistence.save','manualSlot1');
  container.querySelector('#hud-load').onclick = () => eventBus.publish('persistence.load','manualSlot1');
  container.querySelector('#hud-export').onclick = () => eventBus.publish('persistence.export');
  container.querySelector('#hud-community').onclick = () => eventBus.publish('hud.community');
  container.querySelector('#hud-glasshouse').onclick = () => eventBus.publish('hud.glasshouse');
  container.querySelector('#hud-careerlog').onclick = () => eventBus.publish('hud.careerlog');
  container.querySelector('#hud-shop').onclick = () => mountShopModal();

  // quick selector: prompt with list + custom
  container.querySelector('#hud-district-change').onclick = () => eventBus.publish('ui.district.change.request');

  // Time and weather display
  eventBus.subscribe('hud.time.update', function(t){
    var el = document.getElementById('hud-time');
    if (!el) return;
    var hh = String(t.hour).padStart ? String(t.hour).padStart(2,'0') : (t.hour<10?'0'+t.hour:t.hour);
    var mm = String(t.minute).padStart ? String(t.minute).padStart(2,'0') : (t.minute<10?'0'+t.minute:t.minute);
    el.textContent = '🕒 ' + hh + ':' + mm + '  (Day ' + t.day + ', ' + t.timeOfDay + ')';
  });
  eventBus.subscribe('hud.weather.update', function(w){
    var el = document.getElementById('hud-weather');
    if (!el) return;
    var icon = (w.state==='rain'?'🌧️':w.state==='storm'?'⛈️':w.state==='fog'?'🌫️':w.state==='overcast'?'⛅':'☀️');
    el.textContent = icon + ' ' + w.state + ', ' + w.temperatureC + '°C';
  });

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
}
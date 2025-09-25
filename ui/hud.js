// ui/hud.js
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
        <div class="hud-char-info">
          <strong id="hud-name">${character.name}</strong>
          <div class="wanted-wrap" style="margin-top:4px;">
            <span class="wanted-label">Wanted:</span>
            <span id="hud-wanted" class="wanted-stars"></span>
          </div>
        </div>
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
        </div>
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

  function wantedLevelFromHeat(heat) {
    var h = Number(heat || 0);
    if (h >= 95) return 5;
    if (h >= 70) return 4;
    if (h >= 45) return 3;
    if (h >= 25) return 2;
    if (h >= 10) return 1;
    return 0;
  }

  function renderWantedStars(level) {
    var el = container.querySelector('#hud-wanted');
    if (!el) return;
    var i, html = '';
    for (i=1;i<=5;i++) {
      html += '<span class="' + (i<=level ? 'on' : 'off') + '">★</span>';
    }
    el.innerHTML = html;
  }

  // Initial render
  renderWantedStars(wantedLevelFromHeat(character.stats.heat));

  eventBus.subscribe('character.stats.updated', function(char){
    Object.entries(char.stats).forEach(function([k,v]){
      const el = statsContainer.querySelector('#hud-stat-' + k + ' strong');
      if (el) el.textContent = v;
    });
    renderWantedStars(wantedLevelFromHeat(char.stats.heat));
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

  // quick selector: prompt with list + custom
  container.querySelector('#hud-district-change').onclick = () => eventBus.publish('ui.district.change.request');

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
}
export function mountHUD(container, character, eventBus){
  container.innerHTML = `
    <style>
      .hud { display:flex; justify-content:space-between; align-items:center; background:#2a2a3e; padding:10px; border-radius:8px; margin-bottom:20px; }
      .hud-char-info { font-size:1.2em; }
      .hud-stats { display:flex; gap:15px; }
      .hud-stat { text-align:center; }
      .hud-stat span { font-size:.8em; color:#a0a0c0; }
      .hud-actions button { font-size:12px; padding:8px 12px; }
    </style>
    <div class="hud">
      <div class="hud-char-info"><strong id="hud-name">${character.name}</strong></div>
      <div id="hud-stats" class="hud-stats">
        ${Object.entries(character.stats).map(([k,v])=>`
          <div class="hud-stat" id="hud-stat-${k}">
            <span>${k.slice(0,3).toUpperCase()}</span><br/>
            <strong>${v}</strong>
          </div>`).join('')}
      </div>
      <div class="hud-actions" style="display:flex; gap:10px;">
        <button id="hud-save">Save</button>
        <button id="hud-load">Load</button>
        <button id="hud-export">Export</button>
        <button id="hud-community">Community</button>
        <button id="hud-glasshouse">Glass House</button>
      </div>
    </div>
  `;

  const statsContainer = container.querySelector('#hud-stats');

  eventBus.subscribe('character.stats.updated', (char)=>{
    Object.entries(char.stats).forEach(([k,v])=>{
      const el = statsContainer.querySelector(`#hud-stat-${k} strong`);
      if (el) el.textContent = v;
    });
  });

  container.querySelector('#hud-save').onclick = () => eventBus.publish('persistence.save','manualSlot1');
  container.querySelector('#hud-load').onclick = () => eventBus.publish('persistence.load','manualSlot1');
  container.querySelector('#hud-export').onclick = () => eventBus.publish('persistence.export');
  container.querySelector('#hud-community').onclick = () => eventBus.publish('hud.community');
  container.querySelector('#hud-glasshouse').onclick = () => eventBus.publish('hud.glasshouse');
}
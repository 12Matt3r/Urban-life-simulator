// src/ui/hud.js
export function createHUD(root = document.body, { eventBus, assetManager, initialStats }) {
  const el = document.createElement('div');
  el.id = 'hud';

  const hudImageUrl = assetManager ? assetManager.get('ui.hud.statsBars') : '';
  if (!hudImageUrl) {
      console.warn('HUD background asset not found. Using fallback style.');
  }

  el.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    width: 250px;
    height: 150px;
    background-image: url('${hudImageUrl}');
    background-size: contain;
    background-repeat: no-repeat;
    z-index: 100;
    color: white;
    font-family: monospace;
  `;

  // Container for the stat text, with padding to align it inside the graphic
  const statsContainer = document.createElement('div');
  statsContainer.style.cssText = 'padding: 20px 0 0 15px; display: flex; flex-direction: column; gap: 8px;';

  root.appendChild(el);
  el.appendChild(statsContainer);

  const healthEl = document.createElement('div');
  const sanityEl = document.createElement('div');
  const moneyEl = document.createElement('div');
  const heatEl = document.createElement('div');

  statsContainer.appendChild(healthEl);
  statsContainer.appendChild(sanityEl);
  statsContainer.appendChild(moneyEl);
  statsContainer.appendChild(heatEl);

  function update(stats) {
    if (!stats) return;
    healthEl.textContent = `Health: ${stats.health}%`;
    sanityEl.textContent = `Sanity: ${stats.sanity}%`;
    moneyEl.textContent = `Money: $${stats.money}`;
    heatEl.textContent = `Heat: ${'★'.repeat(stats.heat || 0)}${'☆'.repeat(5 - (stats.heat || 0))}`;
  }

  if (eventBus) {
    eventBus.subscribe('stats:updated', update);
  }

  // Set initial state
  update(initialStats);

  function destroy() {
    // In a more complex app, we'd unsubscribe from the eventBus here.
    el.remove();
  }

  return { el, destroy, update };
}
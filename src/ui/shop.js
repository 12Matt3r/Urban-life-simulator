export function createShop(root = document.body, { gameManager, gameAudio } = {}) {
  const container = document.createElement('div');
  container.id = 'shop-overlay-container';
  container.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:5000; display:none; align-items:center; justify-content:center;';

  const shopHtml = `
    <div style="background:var(--panel); padding:20px; border-radius:12px; border:1px solid var(--line); text-align:center; color: var(--ink);">
      <h2>Corner Store</h2>
      <p style="color: var(--muted);">A dusty little shop. Smells like synth-jerky.</p>
      <button id="buy-water-btn" class="uls-dev-btn">Buy Water ($5)</button>
      <button id="close-shop-btn" class="uls-dev-btn" style="margin-left:10px;">Leave</button>
    </div>
  `;

  container.innerHTML = shopHtml;
  root.appendChild(container);

  function buyWater() {
    if (!gameManager || !gameAudio) return;

    const playerMoney = gameManager.getStat('money');
    const itemCost = 5;

    if (playerMoney >= itemCost) {
      gameManager.modifyStat('money', -itemCost);
      // Assuming an inventory system might exist on gameManager
      if (typeof gameManager.addItem === 'function') {
        gameManager.addItem({ id: 'water_bottle', name: 'Bottled Water' });
      }
      gameAudio.play('success'); // Assuming a generic success sound
      console.log('You bought a bottle of water.');
    } else {
      gameAudio.play('error'); // Assuming a generic error sound
      console.log("You don't have enough money.");
    }
  }

  function show() {
    container.style.display = 'flex';
  }

  function hide() {
    container.style.display = 'none';
  }

  container.querySelector('#buy-water-btn').onclick = buyWater;
  container.querySelector('#close-shop-btn').onclick = hide;

  function destroy() {
    container.remove();
  }

  return { show, hide, destroy, el: container };
}
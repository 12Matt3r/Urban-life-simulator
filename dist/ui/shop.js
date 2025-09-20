// ui/shop.js
import { eventBus } from '../systems/eventBus.js';

export function mountShopModal() {
  // Ensure only one modal is open at a time
  const existingModal = document.querySelector('#shop-modal');
  if (existingModal) return;

  const modal = document.createElement('div');
  modal.id = 'shop-modal';
  modal.className = 'modal-overlay';

  // We need to know the current status when opening
  // This is a bit tricky without a central state store access here.
  // For now, we will assume it's open and wait for the next event.
  // A better implementation would get the state on init.
  let isOpen = true;

  function render() {
    modal.innerHTML = `
      <div class="modal-content">
        <div class="community-header">
          <h4>General Store</h4>
          <button id="shop-close-btn">Close</button>
        </div>
        <div class="community-body">
          ${isOpen
            ? '<p>Welcome! We have many things for sale.</p>'
            : '<p>The store is currently closed. Please come back between 08:00 and 20:00.</p>'}
        </div>
      </div>
    `;
    modal.querySelector('#shop-close-btn').onclick = () => {
      unsub(); // Clean up subscription
      document.body.removeChild(modal);
    };
  }

  const unsub = eventBus.subscribe('world.venue-status', function(event) {
    if (event.venueId === 'generalStore') {
      isOpen = event.open;
      render();
    }
  });

  render();
  document.body.appendChild(modal);
}

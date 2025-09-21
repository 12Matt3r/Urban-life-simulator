import { getTimeState } from '../systems/time.js';

const SHOP_ITEMS = [
  { name: 'Coffee', price: 5 },
  { name: 'Bus Ticket', price: 3 },
  { name: 'Mysterious Key', price: 100 },
  { name: 'Pre-paid Phone', price: 50 },
];

const SHOP_OPEN_HOURS = ['Morning', 'Afternoon']; // Open from morning to afternoon

export function mountShop(container, onClose, onBuy) {
  const timeState = getTimeState();
  const isShopOpen = SHOP_OPEN_HOURS.includes(timeState.timeOfDay);

  let content = '';
  if (isShopOpen) {
    content = `
      <div class="shop-items">
        ${SHOP_ITEMS.map(item => `
          <div class="shop-item">
            <span>${item.name}</span>
            <span class="price">$${item.price}</span>
            <button class="buy-btn" data-item-name="${item.name}" data-item-price="${item.price}">Buy</button>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    content = `<p>The shop is currently closed. Come back between ${SHOP_OPEN_HOURS[0]} and ${SHOP_OPEN_HOURS[1]}.</p>`;
  }

  container.innerHTML = `
    <style>
      .shop-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80vw;
        max-width: 500px;
        background: #1a1a2e;
        border: 1px solid #7b52c9;
        border-radius: 10px;
        z-index: 200;
        display: flex;
        flex-direction: column;
        padding: 20px;
        box-shadow: 0 0 30px rgba(0,0,0,0.5);
      }
      .shop-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #3a3a5e;
        padding-bottom: 10px;
        margin-bottom: 10px;
      }
      .shop-items {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .shop-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background: #2a2a3e;
        border-radius: 5px;
      }
      .shop-item .price {
        color: #00bcd4;
        font-weight: bold;
      }
    </style>
    <div class="shop-modal">
      <div class="shop-header">
        <h2>General Store</h2>
        <button id="shop-close">Close</button>
      </div>
      <div class="shop-body">
        ${content}
      </div>
    </div>
  `;

  container.querySelector('#shop-close').onclick = onClose;

  // Add event listeners for buy buttons
  container.querySelectorAll('.buy-btn').forEach(btn => {
    btn.onclick = (e) => {
      const itemName = e.target.dataset.itemName;
      const itemPrice = parseInt(e.target.dataset.itemPrice, 10);
      if (onBuy) {
        onBuy(itemName, itemPrice);
      }
    };
  });
}

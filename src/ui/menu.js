/**
 * @file src/ui/menu.js
 * @description Manages the main menu modal.
 */

function createMenuModal() {
  // If a modal already exists, remove it to prevent duplicates
  const existingModal = document.getElementById('menu-modal');
  if (existingModal) {
    existingModal.remove();
    return; // Toggle off
  }

  const modal = document.createElement('div');
  modal.id = 'menu-modal';
  modal.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: #1a1a1a;
    color: #fff;
    padding: 24px;
    border-radius: 12px;
    z-index: 100000;
    min-width: 320px;
    border: 1px solid #333;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  `;

  modal.innerHTML = `
    <h2 style="margin-top:0; text-align:center;">Menu</h2>
    <button id="save-load-btn" style="display:block; width:100%; margin:8px 0; padding:12px; border-radius:8px; background:#222; color:#fff; border:0; cursor:pointer;">Save & Load</button>
    <button id="transcript-btn" style="display:block; width:100%; margin:8px 0; padding:12px; border-radius:8px; background:#222; color:#fff; border:0; cursor:pointer;">View Transcript</button>
    <button id="credits-btn" style="display:block; width:100%; margin:8px 0; padding:12px; border-radius:8px; background:#222; color:#fff; border:0; cursor:pointer;">About & Credits</button>
    <button id="close-menu-btn" style="display:block; width:100%; margin:16px 0 0; padding:12px; border-radius:8px; background:#1f6feb; color:#fff; border:0; cursor:pointer;">Close</button>
  `;

  document.body.appendChild(modal);

  // --- Event Listeners ---
  document.getElementById('save-load-btn').addEventListener('click', () => {
    window.openSaveLoadMenu();
    modal.remove(); // Close menu after opening submenu
  });

  document.getElementById('transcript-btn').addEventListener('click', () => {
    window.toggleTranscript();
    modal.remove(); // Close menu
  });

  document.getElementById('credits-btn').addEventListener('click', () => {
    window.openCreditsMenu();
    modal.remove(); // Close menu
  });

  document.getElementById('close-menu-btn').addEventListener('click', () => {
    modal.remove();
  });
}

// Register the 'menu' route with the application's router
window.__app.router.register('menu', {
  enter: createMenuModal
});

/**
 * @file src/ui/credits.js
 * @description Manages the "About & Credits" modal for the game.
 * This has been updated to support the Chroma Awards submission.
 */

// --- DYNAMIC CONTENT: PLEASE PROVIDE ---
const CHROMA_LOGO_URL = 'https://via.placeholder.com/200x100.png?text=Chroma+Logo'; // <-- REPLACE THIS
const AI_TOOLS_USED = [
  'Rosebud AI',
  'ElevenLabs',
  'Midjourney'
];
// -----------------------------------------

function createCreditsModal() {
  const existingModal = document.getElementById('credits-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'credits-modal';
  modal.style.cssText = `
    position: fixed; left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    background: #1a1a1a; color: #fff;
    padding: 24px; border-radius: 12px;
    z-index: 100001; min-width: 480px;
    max-width: 90vw; border: 1px solid #333;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    font-family: system-ui, sans-serif;
  `;

  modal.innerHTML = `
    <h2 style="margin-top:0;">About & Credits</h2>
    <p>Urban Life Simulator is a narrative-driven game created for the Chroma Awards.</p>

    <div id="chroma-info" style="margin: 20px 0; padding: 12px; background: #222; border-radius: 8px; text-align: center;">
      <img src="${CHROMA_LOGO_URL}" alt="Chroma Awards Logo" style="max-width: 150px; margin-bottom: 12px;">
      <p style="margin:0;">Submitted to the <a href="https://www.ChromaAwards.com" target="_blank" style="color: #1f6feb;">Chroma Awards</a>.</p>
    </div>

    <div id="ai-tools-info" style="margin: 20px 0;">
      <h3>AI Tools Used</h3>
      <ul id="ai-tools-list" style="list-style: none; padding: 0;">
        ${AI_TOOLS_USED.map(tool => `<li style="margin: 4px 0; background: #222; padding: 6px 10px; border-radius: 6px;">${tool}</li>`).join('')}
      </ul>
    </div>

    <button id="close-credits-btn" style="display:block; width:100%; padding:12px; border-radius:8px; background:#1f6feb; color:#fff; border:0; cursor:pointer;">Close</button>
  `;

  document.body.appendChild(modal);

  document.getElementById('close-credits-btn').addEventListener('click', () => {
    modal.remove();
  });

  return modal;
}

window.openCreditsMenu = function() {
  createCreditsModal();
};

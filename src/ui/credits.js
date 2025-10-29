/**
 * @file src/ui/credits.js
 * @description Manages the "About & Credits" modal for the game.
 * This has been updated to support the Chroma Awards submission.
 */

// --- DYNAMIC CONTENT: FINAL ASSETS ---
const CHROMA_LOGO_URL = 'https://4ltqyfmj7qxvbmbnpmlr.c.websim.com/C9DB522A-8858-4512-8255-526EC361734C.png';
// URLs for AI tools and platforms
const AI_TOOLS_USED = [
  { name: 'OpenAI', logoUrl: 'https://4ltqyfmj7qxvbmbnpmlr.c.websim.com/A622E64A-737B-4F2A-99B7-238A6635A611.jpeg' },
  { name: 'Midjourney', logoUrl: 'https://4ltqyfmj7qxvbmbnpmlr.c.websim.com/1927A5A2-0337-459D-8C34-D335B66AEFAA.jpeg' },
  { name: 'Rosebud AI', logoUrl: 'https://4ltqyfmj7qxvbmbnpmlr.c.websim.com/E09873E1-E624-4131-9C0A-0662250275A4.jpeg' },
  { name: 'ElevenLabs', logoUrl: 'https://4ltqyfmj7qxvbmbnpmlr.c.websim.com/5D6D5039-B62C-453A-9388-15A36A6EF283.jpeg' }
];

const PLATFORM_LOGOS = [
  { name: 'Websim', logoUrl: 'https://4ltqyfmj7qxvbmbnpmlr.c.websim.com/5272355E-2438-4236-A05A-93444A682833.png' },
  { name: 'Vercel', logoUrl: 'https://4ltqyfmj7qxvbmbnpmlr.c.websim.com/E8573219-59F6-4C52-97F2-81C5CD230C2E.jpeg' },
  { name: 'Supabase', logoUrl: 'https://4ltqyfmj7qxvbmbnpmlr.c.websim.com/2622DB36-8575-4C33-874D-342C01574320.png' }
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
    z-index: 100001; width: 560px;
    max-width: 90vw; border: 1px solid #333;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    font-family: system-ui, sans-serif;
  `;

  const renderLogoGrid = (items) => `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px; margin-top: 12px;">
      ${items.map(item => `
        <div style="background: #282828; border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: center; height: 60px;">
          <img src="${item.logoUrl}" alt="${item.name} Logo" style="max-width: 100%; max-height: 40px; object-fit: contain;">
        </div>
      `).join('')}
    </div>
  `;

  modal.innerHTML = `
    <h2 style="margin-top:0;">About & Credits</h2>
    <p>Urban Life Simulator is a narrative-driven game created for the Chroma Awards.</p>

    <div id="chroma-info" style="margin: 20px 0; padding: 12px; background: #222; border-radius: 8px; text-align: center;">
      <a href="https://www.ChromaAwards.com" target="_blank">
        <img src="${CHROMA_LOGO_URL}" alt="Chroma Awards Logo" style="max-width: 160px; margin-bottom: 8px;">
      </a>
    </div>

    <div id="tools-section" style="margin: 24px 0;">
      <h3 style="margin-bottom: 8px;">Core AI Tools</h3>
      ${renderLogoGrid(AI_TOOLS_USED)}
    </div>

    <div id="platform-section" style="margin: 24px 0;">
      <h3 style="margin-bottom: 8px;">Platforms & Services</h3>
      ${renderLogoGrid(PLATFORM_LOGOS)}
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

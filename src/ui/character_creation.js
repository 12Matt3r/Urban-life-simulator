// src/ui/character_creation.js

function initCharacterCreation() {
  const charCreationHTML = `
    <div id="char">
      <h3>Create Your Character</h3>
      <input id="char-name" placeholder="Name" />
      <input id="char-role" placeholder="Role (e.g., Artist, Hustler)" />
      <label style="display:flex; align-items:center; margin: 8px 0;">
        <input type="checkbox" id="char-adult" />
        <span style="margin-left:8px;">Enable Adult Content</span>
      </label>
      <button id="start-btn">Start</button>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', charCreationHTML);

  const startBtn = document.getElementById('start-btn');
  startBtn.addEventListener('click', () => {
    const name = document.getElementById('char-name').value;
    const role = document.getElementById('char-role').value;
    const adult = document.getElementById('char-adult').checked;

    window.__app.player = { name: name || 'Rookie', role: role || 'Free Spirit', adult };

    // Initialize stats with a starting bonus
    Object.assign(window.__app.stats, { money: 20 });

    eventBus.publish('character.created', { player: window.__app.player, stats: window.__app.stats });

    document.getElementById('char').remove();

    // Start the tutorial after character creation
    eventBus.publish('tutorial.start');
  });
}

// Check if we should skip character creation (e.g., in a test)
if (!window.__E2E_TEST_MODE__) {
  initCharacterCreation();
}

// src/ui/character_creation.js
export function createCharacterCreationScreen(root = document.body, { bus }) {
  const container = document.createElement('div');
  container.id = 'character-creation-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: monospace;
  `;

  const formHtml = `
    <div style="background: var(--panel, #111); padding: 30px; border-radius: 12px; text-align: center; border: 1px solid var(--line, #333);">
      <h2>Create Your Character</h2>
      <p style="color: var(--muted, #999);">Define your role in the neon-drenched world.</p>
      <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 15px; align-items: center;">
        <input type="text" id="char-name-input" placeholder="Character Name" style="padding: 10px; width: 250px; background: #222; border: 1px solid #444; color: white; border-radius: 5px;">
        <input type="text" id="char-role-input" placeholder="Character Role (e.g., 'Synth-Junkie')" style="padding: 10px; width: 250px; background: #222; border: 1px solid #444; color: white; border-radius: 5px;">
        <button id="start-game-btn" style="padding: 10px 20px; background: var(--acc, #00ffa2); color: var(--bg, #000); border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Begin Life</button>
      </div>
    </div>
  `;

  container.innerHTML = formHtml;
  root.appendChild(container);

  const nameInput = container.querySelector('#char-name-input');
  const roleInput = container.querySelector('#char-role-input');
  const startButton = container.querySelector('#start-game-btn');

  function show() {
    container.style.display = 'flex';
  }

  function hide() {
    container.style.display = 'none';
  }

  function handleStart() {
    const name = nameInput.value.trim();
    const role = roleInput.value.trim();

    if (!name || !role) {
      alert('Please provide a name and a role for your character.');
      return;
    }

    bus.emit('character:created', { name, role });
    hide();
  }

  startButton.addEventListener('click', handleStart);

  function destroy() {
    startButton.removeEventListener('click', handleStart);
    container.remove();
  }

  // Initially hidden
  hide();

  return { show, hide, destroy, el: container };
}
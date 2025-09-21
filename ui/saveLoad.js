import { eventBus } from '../systems/eventBus.js';
import { listSaves } from '../systems/db.js';

const SLOTS = ['A', 'B', 'C', 'Autosave'];

async function getSaveData() {
  const cloudSaves = await listSaves();
  const saveData = {};

  SLOTS.forEach(slotId => {
    const cloudSave = cloudSaves.find(s => s.slot === slotId);
    const localSave = localStorage.getItem(`uls_save_${slotId}`);

    saveData[slotId] = {
      cloud: cloudSave ? new Date(cloudSave.updated_at).toLocaleString() : null,
      local: !!localSave
    };
  });

  return saveData;
}

export async function mountSaveLoad(container, onClose) {
  const saveData = await getSaveData();

  container.innerHTML = `
    <style>
      .save-load-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80vw;
        max-width: 600px;
        background: #1a1a2e;
        border: 1px solid #7b52c9;
        border-radius: 10px;
        z-index: 200;
        padding: 20px;
        box-shadow: 0 0 30px rgba(0,0,0,0.5);
      }
      .save-load-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #3a3a5e;
        padding-bottom: 10px;
        margin-bottom: 10px;
      }
      .save-slots { display: flex; flex-direction: column; gap: 15px; }
      .save-slot {
        padding: 15px;
        background: #2a2a3e;
        border-radius: 8px;
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 10px;
        align-items: center;
      }
      .slot-info { font-size: 0.9em; color: #a0a0c0; }
      .slot-info strong { color: #e0e0e0; font-size: 1.2em; }
    </style>
    <div class="save-load-modal">
      <div class="save-load-header">
        <h2>Save / Load Game</h2>
        <button id="save-load-close">Close</button>
      </div>
      <div class="save-slots">
        ${SLOTS.map(slotId => `
          <div class="save-slot">
            <div>
              <div class="slot-info"><strong>Slot ${slotId}</strong></div>
              <div class="slot-info">
                Cloud: ${saveData[slotId].cloud || 'Empty'}<br>
                Local: ${saveData[slotId].local ? 'Saved' : 'Empty'}
              </div>
            </div>
            <button class="save-btn" data-slot="${slotId}">Save</button>
            <button class="load-btn" data-slot="${slotId}" ${!saveData[slotId].cloud && !saveData[slotId].local ? 'disabled' : ''}>Load</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelector('#save-load-close').onclick = onClose;

  container.querySelectorAll('.save-btn').forEach(btn => {
    btn.onclick = (e) => {
      const slotId = e.target.dataset.slot;
      eventBus.publish('persistence.save', slotId);
      on-close(); // Close modal after action
    };
  });

  container.querySelectorAll('.load-btn').forEach(btn => {
    btn.onclick = (e) => {
      const slotId = e.target.dataset.slot;
      eventBus.publish('persistence.load', slotId);
      on-close();
    };
  });
}

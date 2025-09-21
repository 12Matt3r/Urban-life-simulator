export function mountStoryLog(container, history, onClose) {
  container.innerHTML = `
    <style>
      .story-log-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80vw;
        max-width: 800px;
        height: 80vh;
        background: #1a1a2e;
        border: 1px solid #7b52c9;
        border-radius: 10px;
        z-index: 200;
        display: flex;
        flex-direction: column;
        padding: 20px;
        box-shadow: 0 0 30px rgba(0,0,0,0.5);
      }
      .story-log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #3a3a5e;
        padding-bottom: 10px;
        margin-bottom: 10px;
      }
      .story-log-body {
        flex: 1;
        overflow-y: auto;
      }
      .story-log-entry {
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #2a2a3e;
      }
      .story-log-entry:last-child {
        border-bottom: none;
      }
      .story-log-title {
        font-weight: bold;
        color: #00bcd4;
        margin-bottom: 5px;
      }
      .story-log-decision {
        color: #a0a0c0;
        font-style: italic;
      }
    </style>
    <div class="story-log-modal">
      <div class="story-log-header">
        <h2>Story Log</h2>
        <button id="story-log-close">Close</button>
      </div>
      <div class="story-log-body">
        ${history.map((entry, index) => `
          <div class="story-log-entry">
            <div class="story-log-title">Chapter ${index + 1}: ${entry.title}</div>
            <div class="story-log-decision">You chose: "${entry.chosenDecisionText}"</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelector('#story-log-close').onclick = onClose;
}

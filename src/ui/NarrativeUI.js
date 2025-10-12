/*
Displays narrative content (text and decisions).
*/
const NarrativeUI = {
  element: null,

  init() {
    this.createElement();
    global.eventBus.subscribe('NARRATIVE_LOADED', (narrative) => this.show(narrative));
  },

  createElement() {
    this.element = document.createElement('div');
    this.element.id = 'narrative-ui';
    this.element.style.cssText = `
      position: fixed;
      bottom: 20%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 10000;
      text-align: center;
      max-width: 600px;
    `;
    document.body.appendChild(this.element);
    this.hide();
  },

  show(narrative) {
    this.element.style.display = 'block';
    this.render(narrative.steps[0]); // For now, just show the first step
  },

  hide() {
    this.element.style.display = 'none';
  },

  render(step) {
    let html = `<p>${step.text}</p>`;
    if (step.decisions) {
      html += '<div>';
      step.decisions.forEach(decision => {
        html += `<button data-action='${JSON.stringify(decision)}'>${decision.text}</button>`;
      });
      html += '</div>';
    } else {
        // If there are no decisions, we need a way to advance.
        html += `<button data-action='{"action":"ADVANCE"}'>Continue</button>`;
    }

    this.element.innerHTML = html;
    this.element.querySelectorAll('button').forEach(button => {
      button.onclick = (e) => {
        const decision = JSON.parse(e.target.getAttribute('data-action'));
        this.handleDecision(decision);
      };
    });
  },

  handleDecision(decision) {
      this.hide();
      if (decision.action === 'BUY_ITEM') {
          global.eventBus.publish('ITEM_PURCHASED', decision.item);
      } else if (decision.action === 'START_ADVENTURE') {
          global.eventBus.publish('ADVENTURE_STARTED');
      } else {
          global.eventBus.publish('NARRATIVE_ADVANCE');
      }
  }
};

NarrativeUI.init();
window.global.narrativeUI = NarrativeUI;
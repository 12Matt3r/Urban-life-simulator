export class GlassHouse {
  constructor(container, eventBus){
    this.container = container;
    this.eventBus = eventBus;
    this.active = false;
    this.character = null;
  }
  enter(character){
    this.active = true;
    this.character = character;
    this.container.hidden = false;
    this.render();
  }
  exit(){
    this.active = false;
    this.container.hidden = true;
    this.container.innerHTML = '';
  }
  render(){
    this.container.innerHTML = `
      <style>
        .glass-house-modal { background:#1a1a2e; border:2px solid #ff009d; padding:30px; border-radius:8px; text-align:center; }
        .glass-house-modal h2 { color:#ff009d; }
      </style>
      <div class="modal-content glass-house-modal">
        <h2>Welcome to The Glass House</h2>
        <p>${this.character?.name || 'You'} are now on the broadcast.</p>
        <p>Viewers can help or sabotage you...</p>
        <p><em>(Stub for sub-game loop)</em></p>
        <button id="gh-exit">Leave The Broadcast</button>
      </div>
    `;
    this.container.querySelector('#gh-exit').onclick = () => this.exit();
  }
}
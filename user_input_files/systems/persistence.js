export class PersistenceSystem {
  constructor(eventBus, getCharacterCb, getHistoryCb){
    this.eventBus = eventBus;
    this.getCharacter = getCharacterCb;
    this.getHistory = getHistoryCb;

    eventBus.subscribe('persistence.save', (slotId)=>this.saveGame(slotId));
    eventBus.subscribe('persistence.load', (slotId)=>this.loadGame(slotId));
    eventBus.subscribe('persistence.export', ()=>this.exportToBook());
  }

  saveGame(slotId='autosave'){
    try{
      const gameState = { character: this.getCharacter(), history: this.getHistory() };
      localStorage.setItem(`uls_save_${slotId}`, JSON.stringify(gameState));
      alert(`Game saved to slot: ${slotId}`);
    }catch(e){
      console.error('Error saving game:', e);
      alert('Error saving game.');
    }
  }

  loadGame(slotId='autosave'){
    try{
      const saved = localStorage.getItem(`uls_save_${slotId}`);
      if (saved){
        alert(`Save found for ${slotId}. Reload flow not implemented in this skeleton.`);
      } else {
        alert(`No save data found for slot: ${slotId}`);
      }
    }catch(e){
      console.error('Error loading game:', e);
      alert('Error loading game.');
    }
  }

  exportToBook(){
    const c = this.getCharacter();
    const h = this.getHistory();
    if (!c || !h || !h.length) return alert('No history to export.');

    let md = `# The Chronicle of ${c.name}\n\n`;
    h.forEach((entry,i)=>{
      if(!entry.title) return;
      md += `## Chapter ${i+1}: ${entry.title}\n\n`;
      if (entry.imageUrl) md += `![Scene Image](${entry.imageUrl})\n\n`;
      if (entry.chosenDecisionText) md += `> ${entry.chosenDecisionText}\n\n`;
    });

    const a = document.createElement('a');
    const file = new Blob([md], { type: 'text/markdown' });
    a.href = URL.createObjectURL(file);
    a.download = `${c.name}_chronicle.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }
}
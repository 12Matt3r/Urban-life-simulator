// systems/persistence.js (ES5)
import { cloudSave, cloudLoad } from './db.js';

function PersistenceSystem(eventBus, getCharacterCb, getHistoryCb) {
  this.eventBus = eventBus;
  this.getCharacter = getCharacterCb;
  this.getHistory = getHistoryCb;

  eventBus.subscribe('persistence.save', this.saveGame.bind(this));
  eventBus.subscribe('persistence.load', this.loadGame.bind(this));
  eventBus.subscribe('persistence.export', this.exportToBook.bind(this));
}

PersistenceSystem.prototype.saveGame = function(slotId) {
  var self = this;
  slotId = slotId || 'autosave';
  try {
    var gameState = { character: self.getCharacter(), history: self.getHistory() };
    localStorage.setItem('uls_save_' + slotId, JSON.stringify(gameState));

    cloudSave(slotId, gameState)
      .then(function() {
        alert('Game saved to slot: ' + slotId + ' (local + cloud)');
      })
      .catch(function(cloudErr) {
        console.warn('Cloud save failed, local save only:', cloudErr);
        alert('Game saved to slot: ' + slotId + ' (local only)');
      });
  } catch (e) {
    console.error('Error saving game:', e);
    alert('Error saving game.');
  }
};

PersistenceSystem.prototype.loadGame = function(slotId) {
  var self = this;
  slotId = slotId || 'autosave';

  function Catcher(cloudErr) {
    console.warn('Cloud load failed, trying local:', cloudErr);
    var localData = localStorage.getItem('uls_save_' + slotId);
    if (localData) {
      handleLoadedData(JSON.parse(localData), 'local');
    } else {
      alert('No save data found for slot: ' + slotId);
    }
  }

  function handleLoadedData(data, source) {
    if (data && data.character && data.history) {
      self.eventBus.publish('persistence.loaded', data);
      alert('Game loaded from slot: ' + slotId + ' (source: ' + source + ')');
    } else {
      alert('Invalid save data found for slot: ' + slotId);
    }
  }

  cloudLoad(slotId)
    .then(function(cloudData) {
      if (cloudData) {
        handleLoadedData(cloudData.data, 'cloud (' + new Date(cloudData.updated_at).toLocaleString() + ')');
      } else {
        Catcher('No cloud data');
      }
    })
    .catch(Catcher);
};

PersistenceSystem.prototype.exportToBook = function() {
  var c = this.getCharacter();
  var h = this.getHistory();
  if (!c || !h || !h.length) return alert('No history to export.');

  var md = '# The Chronicle of ' + c.name + '\n\n';
  h.forEach(function(entry, i) {
    if (!entry.title) return;
    md += '## Chapter ' + (i + 1) + ': ' + entry.title + '\n\n';
    if (entry.imageUrl) md += '![Scene Image](' + entry.imageUrl + ')\n\n';
    if (entry.chosenDecisionText) md += '> ' + entry.chosenDecisionText + '\n\n';
  });

  var a = document.createElement('a');
  var file = new Blob([md], { type: 'text/markdown' });
  a.href = URL.createObjectURL(file);
  a.download = c.name + '_chronicle.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
};

export { PersistenceSystem };
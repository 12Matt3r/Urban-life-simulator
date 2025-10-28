/**
 * @file src/systems/realms.js
 * @description Manages the game's different realms and their integrations.
 */
import { eventBus } from './bus.js';
import { iframeManager } from '../core/IframeManager.js';
import { ULS_CONFIG } from '../config.js';

class Realms {
  constructor() {
    this.registerRealms();
  }

  registerRealms() {
    const realms = {
      'living-hell': {
        enter: () => {
          window.__app.realm = 'living-hell';
          eventBus.publish('image.request', { prompt: 'reality show house interior, fishtank glass walls, cameras, dramatic lighting' });
          window.__app.gameManager.commitTurn({
            realm: 'living-hell',
            text: "You're live. Keep the crowd happy. What's your move?",
            decisions: [{ text: 'truth or dare' }, { text: 'perform a stunt' }, { text: 'confess a secret' }, { text: 'prank someone' }],
            hype: true
          });
          iframeManager.ensure('living-hell-viewer', ULS_CONFIG.HELL_VIEWER_URL);
        }
      },
      'dreamworld': {
        enter: () => {
          window.__app.realm = 'dreamworld';
          eventBus.publish('image.request', { prompt: 'surreal floating islands over a sleeping city, cosmic sky, vapor haze' });
          window.__app.gameManager.commitTurn({
            realm: 'dreamworld',
            text: 'Symbols whisper. Choose a path.',
            decisions: [{ text: 'door of memory' }, { text: 'bridge of fear' }, { text: 'lake of reflection' }]
          });
          iframeManager.ensure('dreamworld', ULS_CONFIG.DREAMWORLD_URL);
        }
      }
    };

    for (const id in realms) {
      window.__app.router.register(id, realms[id]);
    }
  }
}

export const realms = new Realms();

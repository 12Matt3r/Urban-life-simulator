/*
Manages the tutorial sequence using a state machine.
*/
const TutorialController = {
  currentState: 'IDLE',
  states: {
    IDLE: {
      enter: () => {},
    },
    WELCOME: {
      enter: () => {
        global.eventBus.publish('NARRATIVE_START', 'welcome');
      },
      events: {
        NARRATIVE_ADVANCE: 'BUY_WEAPON_PROMPT',
      }
    },
    BUY_WEAPON_PROMPT: {
      enter: () => {
        global.eventBus.publish('NARRATIVE_START', 'buy_weapon');
      },
      events: {
        ITEM_PURCHASED: (item) => {
          if (item.type === 'weapon') {
            return 'WEAPON_PURCHASED';
          }
        }
      }
    },
    WEAPON_PURCHASED: {
      enter: () => {
        global.eventBus.publish('NARRATIVE_START', 'weapon_purchased');
      },
      events: {
        NARRATIVE_ADVANCE: 'BUY_ARMOR_PROMPT',
      }
    },
    BUY_ARMOR_PROMPT: {
      enter: () => {
        global.eventBus.publish('NARRATIVE_START', 'buy_armor');
      },
      events: {
        ITEM_PURCHASED: (item) => {
          if (item.type === 'armor') {
            return 'ARMOR_PURCHASED';
          }
        }
      }
    },
    ARMOR_PURCHASED: {
      enter: () => {
        global.eventBus.publish('NARRATIVE_START', 'armor_purchased');
      },
      events: {
        NARRATIVE_ADVANCE: 'START_ADVENTURE_PROMPT',
      }
    },
    START_ADVENTURE_PROMPT: {
      enter: () => {
        global.eventBus.publish('NARRATIVE_START', 'start_adventure');
      },
      events: {
        ADVENTURE_STARTED: 'COMPLETED',
      }
    },
    COMPLETED: {
      enter: () => {
        console.log('Tutorial completed!');
        // Maybe publish an event here
      }
    }
  },

  init() {
    global.eventBus.subscribe('TUTORIAL_START', () => this.transitionTo('WELCOME'));
    global.eventBus.subscribe('NARRATIVE_ADVANCE', () => this.handleEvent('NARRATIVE_ADVANCE'));
    global.eventBus.subscribe('ITEM_PURCHASED', (item) => this.handleEvent('ITEM_PURCHASED', item));
    global.eventBus.subscribe('ADVENTURE_STARTED', () => this.handleEvent('ADVENTURE_STARTED'));
  },

  transitionTo(newState) {
    console.log(`Transitioning from ${this.currentState} to ${newState}`);
    this.currentState = newState;
    this.states[this.currentState].enter();
  },

  handleEvent(eventName, data) {
    const currentStateConfig = this.states[this.currentState];
    if (currentStateConfig.events && currentStateConfig.events[eventName]) {
      const handler = currentStateConfig.events[eventName];
      let nextState;
      if (typeof handler === 'function') {
        nextState = handler(data);
      } else {
        nextState = handler; // It's a string
      }

      if (nextState) {
        this.transitionTo(nextState);
      }
    }
  }
};

TutorialController.init();
window.global.tutorialController = TutorialController;
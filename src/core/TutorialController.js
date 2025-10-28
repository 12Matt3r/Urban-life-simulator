// src/core/TutorialController.js

class TutorialController {
  constructor({ clock = window, onStep = () => {}, onFinish = () => {} } = {}) {
    this.clock = clock;
    this.onStep = onStep;
    this.onFinish = onFinish;
    this.state = 'idle'; // idle | running | skipped | finished | stopped
    this.step = 0;
    this.steps = [
      { id: 'welcome', text: 'Welcome to the Urban Life Simulator.' },
      { id: 'intro-1', text: 'You find yourself in a strange, neon-lit city.' },
      { id: 'intro-2', text: 'Your goal is to survive and thrive.' },
      { id: 'intro-3', text: 'Try typing an action in the input bar below, like "look around".' }
    ];
    this._timeout = null;

    // Listen for the start signal
    eventBus.subscribe('tutorial.start', () => this.start());
  }

  start() {
    // Don't start if a tutorial skip flag is set
    if (window[window.ULS_CONFIG.SKIP_TUTORIAL_FLAG]) {
      this.state = 'skipped';
      this.onFinish({ skipped: true });
      return;
    }

    this.state = 'running';
    this.step = 0;
    this._runStep();
  }

  _runStep() {
    if (this.step >= this.steps.length) {
      this.state = 'finished';
      this.onFinish({ skipped: false });
      eventBus.publish('TUTORIAL_COMPLETE');
      return;
    }

    const currentStep = this.steps[this.step];
    this.onStep(currentStep, this.step);
    this.step += 1;

    // In E2E tests, advance steps much faster
    const STEP_DELAY_MS = window.E2E_TEST_MODE ? 250 : 1800;
    this._timeout = this.clock.setTimeout(() => this._runStep(), STEP_DELAY_MS);
  }

  stop() {
    this.state = 'stopped';
    if (this._timeout) {
      this.clock.clearTimeout(this._timeout);
    }
  }
}

// Instantiate and connect the tutorial to the game's event bus
new TutorialController({
  onStep: (step) => {
    // Play a sound effect for each step to enhance the experience
    if (window.playDing) {
      window.playDing();
    }

    // For each step, commit a turn to the game history to display it
    __app.gameManager.commitTurn({
      realm: 'tutorial',
      text: step.text,
      decisions: [{ text: 'Next' }],
    });
  },
  onFinish: ({ skipped }) => {
    // When the tutorial is finished (and not skipped), award the Monkey Paw
    if (!skipped) {
      eventBus.publish('monkeypaw.pickup');
    }
    // Transition to the main game realm
    __app.router.go('uls');
  },
});


class TutorialController {
  constructor(ui, app) {
    this.ui = ui;
    this.app = app;
    this.steps = [];
    this.currentStep = 0;
  }

  addStep(step) {
    this.steps.push(step);
  }

  start() {
    this.currentStep = 0;
    this.showStep();
  }

  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.showStep();
    }
  }

  prev() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.showStep();
    }
  }

  showStep() {
    const step = this.steps[this.currentStep];
    if (step) {
      if (step.action) {
        step.action();
      }
      this.ui.update({
        text: step.text,
        buttons: [{
          text: 'Next',
          action: () => this.next()
        }]
      });
    }
  }

  isActive() {
    return this.currentStep < this.steps.length;
  }
}

export default TutorialController;

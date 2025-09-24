// /kernel/state.js (ES module)
export var state = {
  player: {
    name: '',
    sex: '',
    district: '',
    stats: {
      health: 100,
      water: 50,
      hunger: 20,
      money: 120,
      heat: 0,
      rep: 0
    }
  },
  flags: {
    tutorFeverDone: false,
    creditsShown: false
  },
  inventory: [],
  time: {
    hour: 9,
    day: 1
  }
};
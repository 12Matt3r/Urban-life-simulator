// /uls/uls.module.js (ES5)
(function(global) {
  var root, bus, state;
  var tutorialStep = 0;

  var tutorialBeats = [
    {
      title: 'Fever Dream',
      description: 'Explosions. Screaming. You are running. A choice appears before you, demanding an instant reaction.',
      choices: [{ text: 'Leap across the chasm.' }, { text: 'Turn back into the fire.' }]
    },
    {
      title: 'Awakening',
      description: 'A calm voice cuts through the chaos. "Wake up. We’re late—into the city!"',
      isNarrator: true,
      choices: [{ text: 'Groan and sit up.' }]
    },
    {
      title: 'Ride to the City',
      description: 'The vehicle hums. The Narrator glances at you. "First time in Chroma? The game is simple: survive. Your health, hunger, and water are vital. Keep an eye on them."',
      isNarrator: true,
      choices: [{ text: 'Got it.' }]
    },
    {
      title: 'Radio Interruption',
      description: 'The radio crackles to life: "...another contestant ejected from the Living Hell house today. Big money, big risks. The show is a hit in Chroma..."',
      isRadio: true,
      choices: [{ text: 'Interesting.' }]
    },
    {
      title: 'First ChromaRide Job',
      description: 'Your first passenger is a nervous-looking exec. "Take me to the Living Hell house, and step on it!"',
      choices: [{ text: 'Accept the ride.' }]
    },
    {
      title: 'Living Hell Prank',
      description: 'While your passenger is distracted, you see a prompt on your console: a chance to mess with the Living Hell contestants. A small prank.',
      choices: [{ text: 'Inject a little chaos.', action: { topic: 'lh.chat.inject', payload: { action: 'prank', payload: { item: 'itch powder' } } } }, { text: 'Ignore it.' }]
    },
    {
      title: 'City Arrival',
      description: 'You arrive in Neon Sprawl. The city is a riot of light and sound. Where to first?',
      choices: [{ text: 'Find a shop.' }, { text: 'Explore the streets.' }]
    },
    {
      title: 'Shop Stop',
      description: 'You find a small corner store. You need water.',
      choices: [{ text: 'Buy a bottle of water.', action: { topic: 'shop.buy', payload: { name: 'Water', price: 10 } } }]
    },
    {
      title: 'Wanted!',
      description: 'A street tough bumps into you, then shoves you. A nearby cop notices the commotion. Your heat rises.',
      choices: [{ text: 'Walk away calmly.', action: { topic: 'wanted.bump', payload: { amount: 15 } } }]
    },
    {
      title: 'The Glitching Wall',
      description: 'You take a shortcut through a back alley. One of the walls seems to... flicker. It looks unstable, almost unreal.',
      choices: [{ text: 'Touch the wall.', action: { topic: 'nav.go', payload: { module: 'Backrooms' } } }, { text: 'Keep walking.' }]
    },
    {
      title: 'Climax',
      description: 'A siren wails in the distance. It\'s getting closer. A debt collector you thought you\'d lost is rounding the corner. You have seconds to act.',
      choices: [{ text: 'Run!' }, { text: 'Hide!' }, { text: 'Fight!' }]
    },
    {
      title: 'Credits',
      description: '...',
      isCredits: true,
      choices: [{ text: 'Continue...' }]
    },
    {
      title: 'A Dream',
      description: '...it was all a dream. The city awaits, for real this time. The sandbox is yours.',
      isSandbox: true,
      choices: [{ text: 'Begin.' }]
    }
  ];

  function mount(r, b, s, params) {
    root = r;
    bus = b;
    state = s;
    root.innerHTML = '<div id="uls-root"></div>';
    if (params && params.isTutorial) {
      tutorialStep = 0;
      runTutorialStep();
    } else {
      startSandboxMode();
    }
  }

  function unmount() {
    if (root) root.innerHTML = '';
  }

  function runTutorialStep() {
    var beat = tutorialBeats[tutorialStep];
    if (!beat) {
      startSandboxMode();
      return;
    }

    if (beat.isCredits) {
      Dialogue.showText('CREDITS\nTools Used: ChatGPT, Google Jules, WebSim, Minimax AI\nMusic: © You\nSite: www.ChromaAwards.com');
    } else if (beat.isSandbox) {
      Dialogue.showText(beat.description);
    } else {
      Dialogue.showText(beat.description);
    }

    // Render choices
    var choicesContainer = document.createElement('div');
    beat.choices.forEach(function(choice) {
      var btn = document.createElement('button');
      btn.textContent = choice.text;
      btn.onclick = function() {
        if (choice.action) {
          bus.publish(choice.action.topic, choice.action.payload);
        }
        tutorialStep++;
        runTutorialStep();
      };
      choicesContainer.appendChild(btn);
    });
    // A real implementation would use a proper UI component for this
    var dialogueEl = document.getElementById('dialogue-container'); // Assuming this exists
    if (dialogueEl) {
      dialogueEl.appendChild(choicesContainer);
    } else {
      root.appendChild(choicesContainer);
    }
  }

  function startSandboxMode() {
    Dialogue.showText('You are now in the sandbox. Good luck.');
    // Here you would start the actual game loop
  }

  global.ULS = {
    mount: mount,
    unmount: unmount
  };

})(window);
// realms/living-hell/systems/lh.challenges.js (ES5)
(function (global) {
  var seeds = [
    { id: 'icebucket', title: 'Cold Open', prompt: 'Dump ice water, then deliver a hype monologue.' },
    { id: 'mock-ad',  title: 'Ad Read Chaos', prompt: 'Sell a ridiculous product live for 30s.' },
    { id: 'duet',     title: 'Blind Duet', prompt: 'Perform a duet with a mystery partner (imaginary works).' }
  ];

  function randomSeed() { return seeds[Math.floor(Math.random()*seeds.length)]; }

  global.LHChallenges = {
    seeds: seeds,
    randomSeed: randomSeed
  };

})(window);
// systems/rng.js (ES5)
function mulberry32(seed) {
  var t = seed >>> 0;
  return function() {
    t += 0x6D2B79F5;
    var r = Math.imul(t ^ t >>> 15, 1 | t);
    r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}

export function createRNG(seed) {
  var rand = mulberry32(seed || 1);
  return {
    seed: seed,
    random: function() { return rand(); },
    pick: function(arr) { return arr[Math.floor(rand() * arr.length)]; },
    shuffle: function(arr) {
      var a = arr.slice();
      var i, j, temp;
      for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(rand() * (i + 1));
        temp = a[i];
        a[i] = a[j];
        a[j] = temp;
      }
      return a;
    }
  };
}
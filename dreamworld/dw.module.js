// /dreamworld/dw.module.js (ES5)
(function(global) {
  var root;

  function mount(r, b, s, params) {
    root = r;
    root.innerHTML = '<h1>Dreamworld</h1><p>Your mind is a canvas.</p>';
    console.log('Dreamworld mounted with params:', params);
  }

  function unmount() {
    if (root) {
      root.innerHTML = '';
    }
    console.log('Dreamworld unmounted.');
  }

  global.DW = {
    mount: mount,
    unmount: unmount
  };

})(window);
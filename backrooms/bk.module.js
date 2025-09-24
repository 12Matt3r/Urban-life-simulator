// /backrooms/bk.module.js (ES5)
(function(global) {
  var root;

  function mount(r, b, s, params) {
    root = r;
    root.innerHTML = '<h1>The Backrooms</h1><p>You are not supposed to be here.</p>';
    console.log('Backrooms mounted with params:', params);
  }

  function unmount() {
    if (root) {
      root.innerHTML = '';
    }
    console.log('Backrooms unmounted.');
  }

  global.BK = {
    mount: mount,
    unmount: unmount
  };

})(window);
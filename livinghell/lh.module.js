// /livinghell/lh.module.js (ES5)
(function(global) {
  var root;

  function mount(r, b, s, params) {
    root = r;
    root.innerHTML = '<h1>Living Hell</h1><p>Welcome to the house.</p>';
    console.log('Living Hell mounted with params:', params);
  }

  function unmount() {
    if (root) {
      root.innerHTML = '';
    }
    console.log('Living Hell unmounted.');
  }

  global.LH = {
    mount: mount,
    unmount: unmount
  };

})(window);
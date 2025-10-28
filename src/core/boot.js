// src/core/boot.js

// Preload SFX if they are defined in the config
if (window.ULS_CONFIG.SFX_DING) {
  document.getElementById('sfx-ding').src = window.ULS_CONFIG.SFX_DING;
}
if (window.ULS_CONFIG.SFX_BUZZ) {
  document.getElementById('sfx-buzz').src = window.ULS_CONFIG.SFX_BUZZ;
}

// If in E2E test mode, bypass character creation and start the game directly.
if (window.__E2E_TEST_MODE__) {
  window.__app.router.go('uls');
}

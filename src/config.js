/**
 * @file src/config.js
 * @description Central configuration for WebSim modules and security settings.
 */

export const ULS_CONFIG = {
  RADIO_IFRAME_URL: "https://websim.com/@SOFAKINGSADBOI/web-page-with-google-fonts-and-custom-styles",
  IMAGE_RENDER_URL: "https://websim.com/p/ef_a_5z1s700iqy97qk4",
  MONKEYPAW_URL: "https://websim.com/p/7qg637rv4g5cqzmhqeux",
  PRIMARY_NARRATOR: "https://websim.com/@sofakingsadboi/uls-narrator-api-pg-13",
  AUTOPILOT_URL: "https://websim.com/p/ukaq5c09ts4t3_uw9vzb",
  HELL_VIEWER_URL: "https://websim.com/p/38_6u3p4dbv2s0ld6htn",
  COIN_ENGINE_URL: "https://websim.com/p/2p3b0jkt2z3jb2z1wybu"
};

// Expose to window for legacy scripts and debugging, but encourage module imports.
window.ULS_CONFIG = ULS_CONFIG;

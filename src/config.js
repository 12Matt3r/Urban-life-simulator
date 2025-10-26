export const ULS_CONFIG = {
  WEBSIM_MODULES: {
    LIVING_HELL_VIEWER: 'https://websim.com/p/38_6u3p4dbv2s0ld6htn',
    DREAMWORLD_MODULE: 'https://websim.com/p/38_6u3p4dbv2s0ld6htn',
    SFX_HOST: 'https://websim.com/p/ef_a_5z1s700iqy97qk4',
    RADIO_IFRAME_URL: 'https://websim.com/@SOFAKINGSADBOI/web-page-with-google-fonts-and-custom-styles',
    COIN_ENGINE: 'https://websim.com/p/2p3b0jkt2z3jb2z1wybu',
    NARRATOR_API: 'https://websim.com/p/i9x6aq89xvbcb35oah3o',
    PG13_NARRATOR: 'https://websim.com/@sofakingsadboi/uls-narrator-api-pg-13',
    ADULT_NARRATOR: 'https://websim.com/@sofakingsadboi/uls-narrator-adult',
    AUTOPILOT: 'https://websim.com/p/ukaq5c09ts4t3_uw9vzb',
    TRIPPY_CAM: 'https://websim.com/p/xcsq1ou_j7g_1gr0l1iw',
    MONKEY_PAW: 'https://websim.com/p/7qg637rv4g5cqzmhqeux'
  },

  WEBSIM_ORIGIN: 'https://websim.com',

  SECURITY: {
    IMAGE_THROTTLE_MS: 8000,
    ALLOWED_ORIGINS: ['https://websim.com']
  },

  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL,
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
  }
};

if (typeof window !== 'undefined') {
  window.ULS_CONFIG = ULS_CONFIG;
}

import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Urban Life Simulator - Core Systems E2E Tests', () => {
  let window;
  let document;

  beforeAll(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost:3000',
      runScripts: 'dangerously',
      resources: 'usable'
    });

    window = dom.window;
    document = window.document;
    global.window = window;
    global.document = document;
  });

  describe('Configuration', () => {
    it('should have ULS_CONFIG defined', async () => {
      const { ULS_CONFIG } = await import('../src/config.js');
      expect(ULS_CONFIG).toBeDefined();
      expect(ULS_CONFIG.WEBSIM_MODULES).toBeDefined();
    });

    it('should have all required WebSim module URLs', async () => {
      const { ULS_CONFIG } = await import('../src/config.js');
      const requiredModules = [
        'LIVING_HELL_VIEWER',
        'NARRATOR_API',
        'COIN_ENGINE',
        'AUTOPILOT',
        'MONKEY_PAW'
      ];

      requiredModules.forEach(module => {
        expect(ULS_CONFIG.WEBSIM_MODULES[module]).toBeDefined();
        expect(ULS_CONFIG.WEBSIM_MODULES[module]).toContain('websim.com');
      });
    });

    it('should have Supabase configuration', async () => {
      const { ULS_CONFIG } = await import('../src/config.js');
      expect(ULS_CONFIG.SUPABASE).toBeDefined();
    });
  });

  describe('Auth System', () => {
    it('should initialize Supabase client', async () => {
      const { initializeAuth, getSupabaseClient } = await import('../src/utils/auth.js');
      initializeAuth();
      const client = getSupabaseClient();
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
    });

    it('should handle auth state listeners', async () => {
      const { onAuthStateChange } = await import('../src/utils/auth.js');
      let called = false;
      const unsubscribe = onAuthStateChange(() => {
        called = true;
      });
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('Storage System', () => {
    it('should validate save game structure', async () => {
      const { saveGame } = await import('../src/utils/storage.js');
      expect(typeof saveGame).toBe('function');
    });

    it('should validate load game structure', async () => {
      const { loadGame, getAllSaves } = await import('../src/utils/storage.js');
      expect(typeof loadGame).toBe('function');
      expect(typeof getAllSaves).toBe('function');
    });

    it('should have export transcript functionality', async () => {
      const { exportTranscript } = await import('../src/utils/storage.js');
      expect(typeof exportTranscript).toBe('function');
    });
  });

  describe('Database Operations', () => {
    it('should have player profile operations', async () => {
      const { getPlayerProfile, updatePlayerProfile } = await import('../src/utils/db.js');
      expect(typeof getPlayerProfile).toBe('function');
      expect(typeof updatePlayerProfile).toBe('function');
    });

    it('should have player stats operations', async () => {
      const {
        getPlayerStats,
        updatePlayerStats,
        markTutorialComplete,
        awardMonkeyPaw
      } = await import('../src/utils/db.js');

      expect(typeof getPlayerStats).toBe('function');
      expect(typeof updatePlayerStats).toBe('function');
      expect(typeof markTutorialComplete).toBe('function');
      expect(typeof awardMonkeyPaw).toBe('function');
    });

    it('should have realm unlocking functionality', async () => {
      const { unlockRealm, isRealmUnlocked } = await import('../src/utils/db.js');
      expect(typeof unlockRealm).toBe('function');
      expect(typeof isRealmUnlocked).toBe('function');
    });

    it('should have transcript operations', async () => {
      const {
        createTranscript,
        updateTranscript,
        getTranscripts
      } = await import('../src/utils/db.js');

      expect(typeof createTranscript).toBe('function');
      expect(typeof updateTranscript).toBe('function');
      expect(typeof getTranscripts).toBe('function');
    });
  });

  describe('IframeManager', () => {
    it('should initialize iframe manager', async () => {
      const { iframeManager } = await import('../src/core/IframeManager.js');
      expect(iframeManager).toBeDefined();
    });

    it('should validate origin checking', async () => {
      const { iframeManager } = await import('../src/core/IframeManager.js');
      expect(iframeManager.isOriginAllowed('https://websim.com')).toBe(true);
      expect(iframeManager.isOriginAllowed('https://evil.com')).toBe(false);
    });

    it('should have module loading functionality', async () => {
      const { loadWebSimModule } = await import('../src/core/IframeManager.js');
      expect(typeof loadWebSimModule).toBe('function');
    });

    it('should have message handler registration', async () => {
      const { registerWebSimHandler } = await import('../src/core/IframeManager.js');
      expect(typeof registerWebSimHandler).toBe('function');
    });
  });

  describe('Security', () => {
    it('should validate origin checking', async () => {
      const { validateOrigin } = await import('../src/utils/security.js');
      expect(validateOrigin('https://websim.com')).toBe(true);
      expect(validateOrigin('https://evil.com')).toBe(false);
    });

    it('should throttle image requests', async () => {
      const { throttleImageRequest, resetImageThrottle } = await import('../src/utils/security.js');

      resetImageThrottle();

      const first = throttleImageRequest();
      expect(first.allowed).toBe(true);

      const second = throttleImageRequest();
      expect(second.allowed).toBe(false);
      expect(second.waitTime).toBeGreaterThan(0);
    });

    it('should sanitize URLs', async () => {
      const { sanitizeURL } = await import('../src/utils/security.js');

      expect(sanitizeURL('https://example.com')).toBe('https://example.com/');
      expect(sanitizeURL('http://example.com')).toBe('http://example.com/');
      expect(sanitizeURL('javascript:alert(1)')).toBeNull();
    });
  });

  describe('GameManager', () => {
    it('should initialize with default state', async () => {
      const { GameManager } = await import('../src/systems/game.js');
      expect(GameManager.player).toBeDefined();
      expect(GameManager.player.health).toBe(100);
      expect(GameManager.player.sanity).toBe(100);
      expect(GameManager.player.money).toBe(50);
    });

    it('should have game state methods', async () => {
      const { GameManager } = await import('../src/systems/game.js');
      expect(typeof GameManager.getGameState).toBe('function');
      expect(typeof GameManager.loadGameState).toBe('function');
    });

    it('should have decision recording', async () => {
      const { GameManager } = await import('../src/systems/game.js');
      expect(typeof GameManager.recordDecision).toBe('function');
      expect(typeof GameManager.recordNarrative).toBe('function');
    });

    it('should have tutorial completion tracking', async () => {
      const { GameManager } = await import('../src/systems/game.js');
      expect(typeof GameManager.completeTutorial).toBe('function');
      expect(typeof GameManager.grantMonkeyPaw).toBe('function');
    });

    it('should modify stats correctly', async () => {
      const { GameManager } = await import('../src/systems/game.js');

      const eventBus = {
        publish: () => {}
      };

      GameManager.init({ eventBus });

      const initialHealth = GameManager.player.health;
      GameManager.modifyStat('health', -10);
      expect(GameManager.player.health).toBe(initialHealth - 10);
    });
  });
});

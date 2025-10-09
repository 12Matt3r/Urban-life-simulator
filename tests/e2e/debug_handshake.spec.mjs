import { test, expect } from '@playwright/test';

test.describe('Debug Narrative Handshake', () => {
  test('should complete the handshake when initialization is triggered manually', async ({ page }) => {
    // --- Narrative Handshake Setup ---
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[NarrativeMock]')) {
        console.log(text);
        consoleLogs.push(text);
      }
    });

    await page.goto('http://localhost:5173/?trace=1');

    // Wait for the main app to load, but before the game is initialized
    await page.waitForFunction(() => window.__app_init_game, null, { timeout: 15000 });

    // Manually trigger the game initialization, bypassing character creation
    await page.evaluate(() => window.__app_init_game({ name: 'Debug', role: 'Debugger' }));

    // --- Narrative Handshake Verification ---
    await expect.poll(async () => {
      const seen = new Set(consoleLogs.map(log => {
        if (log.includes('ENGINE_READY')) return 'READY';
        if (log.includes('SEQUENCE_STARTED')) return 'STARTED';
        if (log.includes('SEQUENCE_ENDED')) return 'ENDED';
        return null;
      }).filter(Boolean));
      return seen.has('READY') && seen.has('STARTED') && seen.has('ENDED');
    }, {
      message: 'The full narrative sequence (READY -> STARTED -> ENDED) did not complete.',
      timeout: 10000,
    }).toBeTruthy();

    console.log('✅ debug: Isolated handshake test passed.');
  });
});
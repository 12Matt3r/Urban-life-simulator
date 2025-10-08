import { test, expect } from '@playwright/test';

test.describe('E2E Verification', () => {
  test('should boot, display HUD with assets, and complete narrative handshake', async ({ page }) => {
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      // Only capture logs from our mock narrative engine for clarity
      if (text.includes('[NarrativeMock]')) {
        console.log(text);
        consoleLogs.push(text);
      }
    });

    await page.goto('http://localhost:5173/?trace=1');

    // Wait for the main application to signal it's ready
    await page.waitForFunction(() => window.__app?.bus, null, { timeout: 15000 });

    // 1. Verify the HUD is visible and has the correct background image from the AssetManager
    const hud = page.locator('#hud');
    await expect(hud).toBeVisible();
    await expect(hud).toHaveCSS('background-image', /stats-bars\.png/);

    // 2. Verify the narrative handshake completes successfully
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
      timeout: 20000,
    }).toBeTruthy();

    // 3. Take a final screenshot for visual confirmation of the complete, working UI
    await page.screenshot({ path: 'tests/e2e/final_verification.png' });
    console.log('✅ verify: E2E test passed, screenshot captured.');
  });
});
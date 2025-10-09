import { test, expect } from '@playwright/test';

test.describe('Wanted System E2E', () => {
  test('should increase heat, update HUD, and trigger a consequence', async ({ page }) => {
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      // Listen for the specific consequence log message
      if (text.includes('[CONSEQUENCE]')) {
        console.log(text);
        consoleLogs.push(text);
      }
    });

    await page.goto('http://localhost:5173/');

    // Wait for the main application to be ready
    await page.waitForFunction(() => window.__app?.gameManager, null, { timeout: 15000 });

    // 1. Verify initial heat is 0 stars
    const hud = page.locator('#hud');
    await expect(hud).toContainText('Heat: ☆☆☆☆☆');

    // 2. Commit an illicit act using the debug method
    await page.evaluate(() => window.__app.gameManager.commitIllicitAct());

    // 3. Verify the HUD updates to show 1 star of heat
    await expect(hud).toContainText('Heat: ★☆☆☆☆');

    // 4. Max out heat to guarantee a consequence will fire soon
    await page.evaluate(() => window.__app.gameManager.modifyStat('heat', 5));
    await expect(hud).toContainText('Heat: ★★★★★');

    // 5. Wait for the consequence system to fire and log a message
    await expect.poll(async () => {
      return consoleLogs.length > 0;
    }, {
      message: 'Consequence event was not triggered within the timeout period.',
      timeout: 10000, // The check runs every 5s, so 10s should be plenty of time
    }).toBeTruthy();

    expect(consoleLogs[0]).toContain('Your high heat level has attracted unwanted attention!');
    console.log('✅ verify: Wanted System E2E test passed.');
  });
});
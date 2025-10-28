// tests/e2e.spec.js
import { test, expect } from '@playwright/test';

test.describe('Urban Life Simulator - Core E2E Verification', () => {

  // Start a local server before running the tests.
  test.beforeAll(async () => {
    // This command assumes `vite` is installed and will serve the project root.
    // Note: Playwright's test runner will handle the server lifecycle.
  });

  test('should load the character creation screen and start the game', async ({ page }) => {
    // Navigate to the local development server.
    await page.goto('http://localhost:5173'); // Default Vite port

    // 1. Verify Character Creation is visible
    await expect(page.locator('#char')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#start-btn')).toBeVisible();

    // 2. Fill out character details
    await page.fill('#char-name', 'Jules');
    await page.fill('#char-role', 'Engineer');
    await page.check('#char-adult');

    // 3. Start the game
    await page.click('#start-btn');

    // 4. Verify the main game UI is now visible
    // The character creation screen should be gone.
    await expect(page.locator('#char')).not.toBeVisible();

    // The main prompt bar should now be on the screen.
    await expect(page.locator('#promptBar')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#playerInput')).toBeVisible();

    // 5. Take a screenshot for verification
    await page.screenshot({ path: 'test-results/screenshot.png' });
  });
});

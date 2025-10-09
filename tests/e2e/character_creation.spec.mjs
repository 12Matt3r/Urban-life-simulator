import { test, expect } from '@playwright/test';

test.describe('Full Application E2E Flow', () => {
  test('should create a character, start the game, and complete the narrative handshake', async ({ page }) => {
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

    // --- Character Creation ---
    const creationScreen = page.locator('#character-creation-container');
    await expect(creationScreen).toBeVisible();

    const nameInput = page.locator('#char-name-input');
    const roleInput = page.locator('#char-role-input');
    const startButton = page.locator('#start-game-btn');

    const testName = 'Jules';
    const testRole = 'Software Engineer';

    await nameInput.fill(testName);
    await roleInput.fill(testRole);
    await startButton.click();
    await expect(creationScreen).toBeHidden();

    // --- Main Game Verification ---
    const hud = page.locator('#hud');
    await expect(hud).toBeVisible();

    const playerState = await page.evaluate(() => window.__app.gameManager.getPlayerState());
    expect(playerState.name).toBe(testName);
    expect(playerState.role).toBe(testRole);

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

    const readyIndex = consoleLogs.findIndex(log => log.includes('ENGINE_READY'));
    const startedIndex = consoleLogs.findIndex(log => log.includes('SEQUENCE_STARTED'));
    const endedIndex = consoleLogs.findIndex(log => log.includes('SEQUENCE_ENDED'));

    expect(readyIndex).toBeGreaterThan(-1);
    expect(startedIndex).toBeGreaterThan(readyIndex);
    expect(endedIndex).toBeGreaterThan(startedIndex);

    console.log('✅ verify: Full E2E flow passed.');
  });
});
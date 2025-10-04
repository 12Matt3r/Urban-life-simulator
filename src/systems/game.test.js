import { describe, it, expect } from 'vitest';
import { GameManager } from './game.js';

describe('GameManager', () => {
  it('should initialize with default player stats', () => {
    // We don't need to call init() for this test, as we are checking the default object state.
    expect(GameManager.player).toBeDefined();
    expect(GameManager.player.health).toBe(100);
    expect(GameManager.player.money).toBe(50);
  });
});
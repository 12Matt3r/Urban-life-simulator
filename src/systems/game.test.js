import { describe, it, expect, vi } from 'vitest';
import { createGameManager } from './game.js';

describe('createGameManager', () => {
  // Helper to create a game manager with default mocks
  const setup = () => {
    const mockBus = {
      on: vi.fn(() => () => {}), // Return a dummy unsubscribe function
      emit: vi.fn(),
    };
    const mockSceneManager = {
      update: vi.fn(),
    };
    const mockNarrative = {
      start: vi.fn(),
    };
    const gameManager = createGameManager({
      bus: mockBus,
      sceneManager: mockSceneManager,
      narrative: mockNarrative,
    });
    return { gameManager, mockBus, mockSceneManager, mockNarrative };
  };

  it('should initialize with default player stats', () => {
    const { gameManager } = setup();
    const playerState = gameManager.getPlayerState();
    expect(playerState).toBeDefined();
    expect(playerState.health).toBe(100);
    expect(playerState.money).toBe(50);
  });

  it('should publish stats when started', () => {
    const { gameManager, mockBus } = setup();
    gameManager.start();
    expect(mockBus.emit).toHaveBeenCalledWith('stats:updated', expect.objectContaining({ health: 100 }));
  });

  it('should subscribe to narrative:engine_ready on start', () => {
    const { gameManager, mockBus } = setup();
    gameManager.start();
    expect(mockBus.on).toHaveBeenCalledWith('narrative:engine_ready', expect.any(Function));
  });

  it('should modify a stat and publish an update', () => {
    const { gameManager, mockBus } = setup();
    gameManager.modifyStat('money', 50);
    expect(gameManager.getPlayerState().money).toBe(100);
    expect(mockBus.emit).toHaveBeenCalledWith('stats:updated', expect.objectContaining({ money: 100 }));
  });

  it('should clamp health between 0 and 100', () => {
    const { gameManager } = setup();
    gameManager.modifyStat('health', -200);
    expect(gameManager.getPlayerState().health).toBe(0);
    gameManager.modifyStat('health', 300);
    expect(gameManager.getPlayerState().health).toBe(100);
  });

  it('should add an item and publish an inventory update', () => {
    const { gameManager, mockBus } = setup();
    const item = { id: 'test_item', name: 'Test Item' };
    gameManager.addItem(item);
    expect(gameManager.getPlayerState().inventory).toContain(item);
    expect(mockBus.emit).toHaveBeenCalledWith('inventory:updated', [item]);
  });

  it('should advance time and publish a time update', () => {
    const { gameManager, mockBus } = setup();
    gameManager.advanceTime(70); // 70 minutes
    const timeState = mockBus.emit.mock.calls.find(call => call[0] === 'time:changed')[1];
    expect(timeState.hour).toBe(9);
    expect(timeState.minute).toBe(10);
  });

  it('should call sceneManager.update on tick', () => {
    const { gameManager, mockSceneManager } = setup();
    const deltaTime = 0.016;
    gameManager.tick(deltaTime);
    expect(mockSceneManager.update).toHaveBeenCalledWith(deltaTime);
  });
});
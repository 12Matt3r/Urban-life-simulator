/**
 * @file src/systems/scene_manager.js
 * @description Manages the game's scene, including background images.
 */
import { eventBus } from './bus.js';

class SceneManager {
  constructor() {
    this.cycle = { time: 'night', weather: 'clear' };
    eventBus.subscribe('cycle.set', p => {
      Object.assign(this.cycle, p);
      this.apply();
    });
    this.apply(); // Initial scene setup
  }

  apply() {
    const prompt = (this.cycle.time === 'night' ? 'nighttime ' : 'daytime ') +
                   (this.cycle.weather === 'rain' ? 'rainy ' : 'clear ') +
                   'Tokyo x New York neon streets, rain-slick reflections';
    eventBus.publish('image.request', { prompt });
  }
}

export const sceneManager = new SceneManager();
